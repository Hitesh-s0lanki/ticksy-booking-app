#!/usr/bin/env bash

# usage: 
#   ./version.sh --main-branch <SHA of perious push(not commit)>
#   ./version.sh -b <SHA of perious push(not commit)>
# usage with mode: (by default it is always validation)
#   ./version.sh --main-branch <SHA of perious push(not commit)> --mode generate
#   ./version.sh -b <SHA of perious push(not commit)> -m validate

set -e

readonly version_file="./src/resources/VERSION" # file containing current version.
# setting proto schema change delta thresholds for package version change.
readonly patch_max_delta=150  # Anything less than 150 delta is a patch update.
readonly minor_max_delta=400  # Anything b/w 150 - 400 delta is a minor update.
  # Everything else is a major update.

#########################
#    Startup Details    #
#########################
# Function to display script usage
function Usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo " -h, --help                Display this help message"
  echo " -b, --main-branch         SHA of Main branch of proto repository at last push"
  echo " -m, --mode                Mode in which the tool runs. Currently there are two modes "generate" and "validate". The default mode is always "validate""
}

function HasArgument() {
  [[ ("$1" == *=* && -n ${1#*=}) || ( ! -z "$2" && "$2" != -*)  ]];
}

function ExtractArgument() {
  echo "${2:-${1#*=}}"
}

# Function to handle options and arguments
function HandleOptions() {
  
  mode="validate"
  while [ $# -gt 0 ]; do
    case $1 in
      -h | --help)
      Usage
      exit 0
      ;;
      -b | --main-branch)
      if ! HasArgument $@; then
        echo "Main branch not specified." >&2
        Usage
        exit 1
      fi

      main_branch=$(ExtractArgument $@)

      shift
      ;;
      -m | --mode)
      if HasArgument $@; then
        mode=$(ExtractArgument $@)
        shift
      fi

      ;;
      *)
      echo "Invalid option: $1" >&2
      Usage
      exit 1
      ;;
    esac
    shift
  done
}


#############################
#    Validation Functions   #
#############################

function ExitWithMessage() {
  echo "$1" >&2
  exit 1
}

# verify the VERSION file exists.
function ValidateVersionFilePresent() {
  if [ ! -f ${version_file} ]; then
    ExitWithMessage "Fatal: Missing Version File."
  fi
}

function ValidateVersionFileContents() {
  local cur_version=$1
  # Get previous version.
  local prev_version=`git show "$main_branch":"$version_file"`
  local gen_version=`GetNewVersion $prev_version`
  
  # assert
  if [[ "$cur_version" != "$gen_version" ]]; then
    ExitWithMessage "Incorrect VERSION. Before: $prev_version Now: $cur_version Expected: $gen_version!! Please sync the changes with latest pull."
  fi
}

function ValidatePom() {
  local cur_version=$1
  # Get version from POM file
  local pom_version=`mvn help:evaluate -Dexpression=project.version -q -DforceStdout`

  # assert
  if [[ "$cur_version" != "$pom_version" ]]; then
    ExitWithMessage "Incorrect Pom version. Now: $pom_version Expected: $cur_version!! Revert all version related changes and regenerate version."
  fi
}

function ValidatePackageJson() {
  local cur_version=$1
  # Get version from package.json file and strip double quotes
  local js_version=$(npm pkg get version | tr -d '"')
  # Assert
  if [[ "$cur_version" != "$js_version" ]]; then
    ExitWithMessage "Incorrect package.json version. Now: $js_version Expected: $cur_version!! Revert all version-related changes and regenerate version."
  fi
}

function ValidatePyprojectToml() {
  local cur_version=$1
  # Get the version from pyproject.toml, strip 'version = "..."' and quotes
  local pyproject_version=$(grep -oP '^\s*version\s*=\s*"\K[^"]+' pyproject.toml)
  # Check if pyproject_version is empty
  if [[ -z "$pyproject_version" ]]; then
    ExitWithMessage "Failed to retrieve version from pyproject.toml. Please ensure the version is defined correctly."
  fi
  # Assert
  if [[ "$cur_version" != "$pyproject_version" ]]; then
    ExitWithMessage "Incorrect pyproject.toml version. Now: $pyproject_version Expected: $cur_version!! Revert all version-related changes and regenerate version."
  fi
}

##########################
#    Utility Functions   #
##########################

function GetMajorVersion() {
  local version_str="$1"
  local major_version=`echo $version_str | cut -d. -f1`
  if [ -z "$major_version" ]; then
    major_version=0
  fi

  echo "$major_version"
}

function GetMinorVersion() {
  local version_str="$1"
  local minor_version=`echo $version_str | cut -d. -f2`
  if [ -z "$minor_version" ]; then
    minor_version=0
  fi

  echo "$minor_version"
}

function GetPatchVersion() {
  local version_str="$1"
  local patch_version=`echo $version_str | cut -d. -f3`
  if [ -z "$patch_version" ]; then
    patch_version=0
  fi

  echo "$patch_version"
}

function GetNewVersion() {
  local version_str="$1"

  # Extracting all the version numbers.
  local major_version=`GetMajorVersion $version_str`
  local minor_version=`GetMinorVersion $version_str`
  local patch_version=`GetPatchVersion $version_str`
  
  # calculating the proto change delta.
  local protostat=`git diff --shortstat $main_branch *.proto`
  local total_delta=0
  if [ ! -z "$protostat" ]; then
    local insertions=`echo "$protostat" | grep -Eo '[0-9]+[[:space:]]+insertions' | grep -Eo '[0-9]+'`
    if [ -z "$insertions" ]; then
      insertions=0
    fi
    local deletions=`echo "$protostat" | grep -Eo '[0-9]+[[:space:]]+deletion' | grep -Eo '[0-9]+'`
    if [ -z "$deletions" ]; then
      deletions=0
    fi
    total_delta=$((insertions + deletions))
  fi

  # updating the version.
  if [ "$total_delta" -le  "$patch_max_delta" ]; then
    patch_version=$((patch_version + 1))
  elif [ "$total_delta" -le  "$minor_max_delta" ]; then
    minor_version=$((minor_version + 1))
    patch_version=0
  else
    major_version=$((major_version + 1))
    minor_version=0
    patch_version=0
  fi

  echo "$major_version.$minor_version.$patch_version"
}

function ReadVersionFile() {
  ValidateVersionFilePresent

  cat ${version_file}
}

function UpdateVersionFileContents() {
  if [ -f $version_file ]; then
    rm $version_file
  fi

  echo "$1" >> $version_file

}

function UpdatePom() {
  mvn versions:set -DgenerateBackupPoms=false -DnewVersion="$1"
}

function UpdatePackageJson() {
  npm pkg set version="$1"
}

function UpdatePyprojectToml() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/version *= *\"[0-9.]*\"/version = \"$1\"/" pyproject.toml
    else
        # Linux and others
        sed -i "s/version *= *\"[0-9.]*\"/version = \"$1\"/" pyproject.toml
    fi
}

###############
#    Modes    #
###############

function generate() {
  # Read existing version.
  version_str=`ReadVersionFile`
  # Generate new version.
  version=`GetNewVersion $version_str`
  # Update contents of VERSION file
  UpdateVersionFileContents "$version"
  # Update contents of POM file
  UpdatePom "$version"
  # Update contents of package.json
  UpdatePackageJson "$version"
  # Update contents of pyproject.toml
  UpdatePyprojectToml "$version"
  
  echo "Version generation succeeded: $version" >&2
  exit 0
}

function validate() {
  # Get current version.
  cur_version=`ReadVersionFile`
  # Validate contents of VERSION file
  ValidateVersionFileContents "$cur_version"
  # Validate contents of POM file
  ValidatePom "$cur_version"
  # Validate contents of package.json
  ValidatePackageJson "$cur_version"
  # Validate contents of pyproject.toml
  ValidatePyprojectToml "$cur_version"
  

  echo "Validation succeeded" >&2
  exit 0
}

##############
#    Main    #
##############

HandleOptions "$@"

if [[ "$mode" == "validate" ]]; then
  validate
elif [[ "$mode" == "generate" ]]; then
  generate
else
  echo "Unsupported mode. Use either 'generate' or 'validate'" >&2
  Usage
  exit 1
fi
