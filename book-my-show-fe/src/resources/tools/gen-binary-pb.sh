#!/usr/bin/env bash

# usage: 
#   ./gen-binary-pb.sh  <generate binary_pb file at default path>
#   ./gen-binary-pb.sh -o   <generate binary_pb file at a given parent directory>
#   ./gen-binary-pb.sh --out   <generate binary_pb file at a given parent directory>

set -e

# Path to the proto files
readonly PROTO_PATH="./src/protos/"

# Base path for all proto tools
readonly PROTO_TOOLS_BASE_PATH="./src/resources/tools"

function Usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo " -o, --out          Provide parent folder directory for output file."
}

if [ $# -eq 2 ]; then
    if [[ "$1" = "-o" || "$1" = "--out" ]]; then
        out_dir=$2
    else
        Usage
        exit 0
    fi
elif [ $# -eq 1 ]; then
    Usage
    exit 0
else
    out_dir=${PROTO_PATH}
fi

# Find all .textproto files in the src directory and it's path will be in textproto_file_path variable
for textproto_file_path in $(find $PROTO_PATH -type f -name "*.textproto"); do
    # Read the first two comment lines from the textproto_file_path
    first_comment=$(sed -n '1p' $textproto_file_path)
    second_comment=$(sed -n '2p' $textproto_file_path)

    # Check if the lines not starting with "#" then continue for the other files
    if [[ $first_comment != "#"* || $second_comment != "#"* ]]; then
        echo "SKIPPING: Invalid format in $textproto_file_path."
        continue
    fi

    echo "Generating binary file from textproto file for $textproto_file_path"

    # Remove "# proto-file:" and "# proto-message:" prefixes
    proto_file_path=$(echo "$first_comment" | sed 's/^# proto-file: //')
    message_name=$(echo "$second_comment" | sed 's/^# proto-message: //')

    # add prefix ./ to the proto_file_path
    proto_file_path=$(echo "./$proto_file_path")

    # Get the package name from the file indicated by the proto_file_path
    package=$(grep -o '^package .*;' "$proto_file_path" | cut -d ' ' -f 2 | tr -d ';')

    # Append the package name to the message name
    proto_message_name="$package.$message_name"

    # Path for the binary output file
    binary_file_path="${textproto_file_path%.textproto}.binary_pb"

    # Remove the prefix ./src/protos/ from the binary_file_path
    binary_file_path=${binary_file_path#./src/protos/}

    # Append the output directory to the binary_file_path
    binary_file_path="$out_dir$binary_file_path"

    # Create directory at specified location
    dir=$(dirname "$binary_file_path")
    mkdir -p $dir

    protoc \
    --proto_path="${PROTO_PATH}" \
    --encode="${proto_message_name}" \
    ${proto_file_path} \
    < ${textproto_file_path} > \
    ${binary_file_path}

    echo "SUCCESS: Binary file at path $binary_file_path"
done