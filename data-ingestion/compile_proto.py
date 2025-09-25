import os
import re
import sys
import logging
import subprocess
from pathlib import Path
from typing import Iterable

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# -------- Config --------
PROTO_SRC_DIR = Path("src/protos")
OUT_PKG = "ticksy_proto_schema"           # top-level Python package name you want
OUT_DIR = Path("src/"+OUT_PKG)                   
PROTOC_PY = [sys.executable, "-m", "grpc_tools.protoc"]
# ------------------------

# Regexes to fix imports in generated *_pb2(.py|_grpc.py) files
# 1) from foo.bar_pb2 import Baz  -> from ticksy_proto_schema.foo.bar_pb2 import Baz
FROM_IMPORT_RE = re.compile(r'^(from\s+)([a-zA-Z0-9_.]+)(_pb2(?:_grpc)?\s+import\s+.+)$', re.M)
# 2) import foo.bar_pb2 as foo__bar__pb2 -> import ticksy_proto_schema.foo.bar_pb2 as foo__bar__pb2
PLAIN_IMPORT_RE = re.compile(r'^(import\s+)([a-zA-Z0-9_.]+)(_pb2(?:_grpc)?\s+as\s+.+)$', re.M)

GOOGLE_PREFIXES = ("google.", "google_")  # generated files sometimes alias google modules


def _list_proto_files(root: Path) -> list[Path]:
    return sorted(root.rglob("*.proto"))


def _run_protoc(proto_files: Iterable[Path]) -> None:
    if not proto_files:
        logging.warning("No .proto files found under %s", PROTO_SRC_DIR)
        return

    # Ensure output package root exists
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # protoc args
    args = [
        *PROTOC_PY,
        f"--proto_path={PROTO_SRC_DIR}",
        f"--python_out={OUT_DIR}",
        f"--grpc_python_out={OUT_DIR}",
        # Optionally stub types (pyi). Uncomment if you want type stubs:
        # f"--pyi_out={OUT_DIR}",
    ]

    # Add all files (absolute paths are fine)
    args.extend(str(p) for p in proto_files)

    logging.info("Running protoc for %d files…", len(proto_files))
    subprocess.run(args, check=True)
    logging.info("protoc completed")


def _ensure_pkg_inits(root: Path) -> None:
    """
    Walk the generated tree and ensure every folder has __init__.py so that
    Python treats it as a package (mirrors the original folder structure).
    """
    for dirpath, dirnames, filenames in os.walk(root):
        d = Path(dirpath)
        (d / "__init__.py").touch(exist_ok=True)


def _needs_prefix(module: str) -> bool:
    """Skip prefixing google.* imports; prefix everything else."""
    return not module.startswith(GOOGLE_PREFIXES)


def _prefix_line(line: str) -> str:
    """
    Add OUT_PKG. prefix to imports like:
      - from foo.bar_pb2 import Baz
      - import foo.bar_pb2 as foo__bar__pb2
    but leave google.* alone.
    """
    def repl_from(m: re.Match) -> str:
        pre, module, post = m.groups()
        if _needs_prefix(module):
            return f"{pre}{OUT_PKG}.{module}{post}"
        return m.group(0)

    def repl_import(m: re.Match) -> str:
        pre, module, post = m.groups()
        if _needs_prefix(module):
            return f"{pre}{OUT_PKG}.{module}{post}"
        return m.group(0)

    # Try FROM import
    line2 = FROM_IMPORT_RE.sub(repl_from, line)
    if line2 != line:
        return line2
    # Try PLAIN import
    return PLAIN_IMPORT_RE.sub(repl_import, line)


def _rewrite_imports_in_file(py_path: Path) -> None:
    """
    Rewrite absolute module imports in generated files to be under OUT_PKG.
    Works for both *_pb2.py and *_pb2_grpc.py files produced by grpcio-tools.
    """
    text = py_path.read_text(encoding="utf-8")

    # Only touch import lines that reference *_pb2 or *_pb2_grpc modules.
    # Run regex substitutions line-by-line to avoid accidental changes elsewhere.
    lines = text.splitlines(keepends=True)
    fixed = [ _prefix_line(ln) for ln in lines ]
    new_text = "".join(fixed)

    if new_text != text:
        py_path.write_text(new_text, encoding="utf-8")
        logging.debug("Rewrote imports in %s", py_path)


def _rewrite_all_imports(root: Path) -> None:
    for py in root.rglob("*.py"):
        # Skip __init__.py (it usually doesn't have inter-proto imports)
        if py.name == "__init__.py":
            continue
        # Operate only on generated artifacts
        if py.name.endswith("_pb2.py") or py.name.endswith("_pb2_grpc.py"):
            _rewrite_imports_in_file(py)


def _export_star_init(root: Path) -> None:
    """
    Create/update top-level package __init__.py to re-export generated modules
    so you can `from ticksy_proto_schema import booking_pb2` directly.
    """
    init_path = root / "__init__.py"
    lines = []

    for py in sorted(root.rglob("*_pb2.py")):
        rel = py.relative_to(root).with_suffix("")  # e.g. foo/bar_pb2
        mod = ".".join(rel.parts)
        lines.append(f"from .{mod} import *\n")

    for py in sorted(root.rglob("*_pb2_grpc.py")):
        rel = py.relative_to(root).with_suffix("")  # e.g. foo/bar_pb2_grpc
        mod = ".".join(rel.parts)
        lines.append(f"from .{mod} import *\n")

    init_path.write_text("".join(lines), encoding="utf-8")


def compile_and_fix():
    """
    1) Compile protos -> OUT_DIR
    2) Ensure package inits
    3) Rewrite imports to be prefixed with OUT_PKG (except google.*)
    4) Create top-level __init__ that re-exports everything
    """
    if not PROTO_SRC_DIR.exists():
        raise FileNotFoundError(f"Proto source dir not found: {PROTO_SRC_DIR}")

    protos = _list_proto_files(PROTO_SRC_DIR)
    logging.info("Found %d proto files", len(protos))
    _run_protoc(protos)
    _ensure_pkg_inits(OUT_DIR)
    _rewrite_all_imports(OUT_DIR)
    _export_star_init(OUT_DIR)
    logging.info("✅ Done. Imports are now under '%s'", OUT_PKG)


if __name__ == "__main__":
    try:
        compile_and_fix()
    except subprocess.CalledProcessError as e:
        logging.error("protoc failed with: %s", e)
        sys.exit(e.returncode)
