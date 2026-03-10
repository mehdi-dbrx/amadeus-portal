#!/usr/bin/env python3
"""
Inject BRANDFETCH_API_KEY from .env.local into app.yaml for Databricks App deploy.
Run from project root. Modifies app.yaml in place; caller should backup/restore if needed.
"""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV_LOCAL = ROOT / ".env.local"
APP_YAML = ROOT / "app.yaml"


def load_env_local() -> dict[str, str]:
    out = {}
    if not ENV_LOCAL.exists():
        return out
    for line in ENV_LOCAL.read_text().splitlines():
        m = re.match(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$", line)
        if m:
            key, val = m.group(1), m.group(2).strip()
            if val.startswith(("'", '"')) and val.endswith(("'", '"')):
                val = val[1:-1]
            out[key] = val
    return out


def yaml_escape(value: str) -> str:
    if not value:
        return '""'
    # Escape backslash and double quote for YAML double-quoted scalar
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def main() -> None:
    env = load_env_local()
    key_value = env.get("BRANDFETCH_API_KEY", "").strip()
    if not key_value:
        return  # Nothing to inject

    content = APP_YAML.read_text()
    # If env section already present, do not double-inject
    if "env:" in content and "BRANDFETCH_API_KEY" in content:
        return

    block = f"""
env:
  - name: BRANDFETCH_API_KEY
    value: {yaml_escape(key_value)}
"""
    new_content = content.rstrip() + block
    APP_YAML.write_text(new_content)
    print("Injected BRANDFETCH_API_KEY into app.yaml")


if __name__ == "__main__":
    main()
