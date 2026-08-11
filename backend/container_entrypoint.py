"""Shell-free, fail-closed container entrypoint for the minimal runtime."""

from __future__ import annotations

import os
import subprocess
import sys


def enabled(name: str) -> bool:
    return os.getenv(name, "0") == "1"


def main() -> None:
    if enabled("RUN_MIGRATIONS"):
        subprocess.run([sys.executable, "manage.py", "migrate", "--noinput"], check=True)
    if enabled("COLLECT_STATIC"):
        subprocess.run(
            [sys.executable, "manage.py", "collectstatic", "--noinput"], check=True
        )
    if len(sys.argv) < 2:
        raise SystemExit("container command is required")
    os.execvp(sys.argv[1], sys.argv[1:])


if __name__ == "__main__":
    main()
