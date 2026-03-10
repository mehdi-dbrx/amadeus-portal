#!/usr/bin/env python3
"""Sync databricks.yml app name from .env.local.

Updates targets.airops.resources.apps.airops_portal.name from DBX_APP_NAME.
Run after changing .env.local.

Usage:
  python deploy/sync_databricks_yml_from_env.py [--dry-run]
  uv run python deploy/sync_databricks_yml_from_env.py [--dry-run]

  --dry-run: Print changes without writing.
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_env_local() -> dict[str, str]:
    env_path = ROOT / ".env.local"
    out = {}
    if not env_path.exists():
        return out
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync databricks.yml app name from .env.local")
    parser.add_argument("--dry-run", action="store_true", help="Print changes without writing")
    args = parser.parse_args()

    yml_path = ROOT / "databricks.yml"
    if not yml_path.exists():
        print(f"Error: {yml_path} not found", file=sys.stderr)
        return 1

    env = load_env_local()
    app_name = env.get("DBX_APP_NAME", "").strip()
    if not app_name:
        print("DBX_APP_NAME not set in .env.local; skipping sync")
        return 0

    content = yml_path.read_text()
    # Replace the app name under targets.airops (second "name:" in file; first is under resources)
    pattern = r"^(\s+name: )([\w-]+)$"
    matches = list(re.finditer(pattern, content, re.MULTILINE))
    if len(matches) < 2:
        print("Could not find targets.airops app name in databricks.yml", file=sys.stderr)
        return 1
    # Second match is under targets.airops.resources.apps.airops_portal
    match = matches[1]
    current = match.group(2)
    if current == app_name:
        print("databricks.yml already in sync with .env.local (DBX_APP_NAME)")
        return 0

    new_content = content[: match.start(2)] + app_name + content[match.end(2) :]
    print("Syncing databricks.yml from .env.local:")
    print(f"  targets.airops app name <- DBX_APP_NAME={app_name}")

    if args.dry_run:
        print("\n[--dry-run] Not writing databricks.yml")
        return 0

    yml_path.write_text(new_content)
    print(f"\nUpdated {yml_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
