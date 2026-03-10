#!/usr/bin/env bash
# Deploy airops-portal to Databricks Apps via bundle.
# Run from project root: ./deploy/deploy.sh
#
# Uses the same workspace and PAT as amadeus-ground: configure the databricks
# CLI with the same profile, and use .env.local with DBX_APP_NAME (e.g. airops-portal).
#
# If "App already exists" error: the script will try to bind automatically;
# or run: databricks bundle deployment bind airops_portal <APP_NAME> -t airops --auto-approve
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Load .env.local so DBX_APP_NAME is available (same workspace/PAT as amadeus-ground)
set -a
[ -f ".env.local" ] && . ./.env.local
set +a

TARGET="${DEPLOY_TARGET:-airops}"
APP_NAME="${DBX_APP_NAME:-airops-portal}"

echo "Deploying (target: $TARGET, app name: $APP_NAME)..."
echo ""

# Sync databricks.yml from .env.local if script and .env.local exist
if [ -f ".env.local" ] && [ -f "deploy/sync_databricks_yml_from_env.py" ]; then
  if command -v python3 &>/dev/null; then
    python3 deploy/sync_databricks_yml_from_env.py 2>/dev/null || true
  elif command -v uv &>/dev/null; then
    uv run python deploy/sync_databricks_yml_from_env.py 2>/dev/null || true
  fi
fi

# Bind existing app if it exists to avoid "App already exists"
if databricks apps get "$APP_NAME" --output json &>/dev/null; then
  echo "Binding existing app $APP_NAME to bundle..."
  databricks bundle deployment bind airops_portal "$APP_NAME" -t "$TARGET" --auto-approve 2>/dev/null || true
fi

# Inject BRANDFETCH_API_KEY from .env.local into app.yaml for deployed app (then restore)
APP_YAML_BAK=""
if [ -f "app.yaml" ] && [ -f ".env.local" ]; then
  if grep -q "BRANDFETCH_API_KEY" .env.local 2>/dev/null; then
    APP_YAML_BAK=$(mktemp)
    cp app.yaml "$APP_YAML_BAK"
    if command -v python3 &>/dev/null; then
      python3 deploy/inject_env_into_app_yaml.py 2>/dev/null || true
    elif command -v uv &>/dev/null; then
      uv run python deploy/inject_env_into_app_yaml.py 2>/dev/null || true
    fi
  fi
fi

echo "Validating bundle..."
databricks bundle validate -t "$TARGET"

echo "Deploying (bundle uploads source and links to app)..."
databricks bundle deploy -t "$TARGET"

# Restore app.yaml so repo does not contain secret
if [ -n "$APP_YAML_BAK" ] && [ -f "$APP_YAML_BAK" ]; then
  mv "$APP_YAML_BAK" app.yaml
fi

echo "Starting app..."
databricks bundle run airops_portal -t "$TARGET"

echo ""
echo "Done."
APP_URL=$(databricks apps get "$APP_NAME" --output json 2>/dev/null | jq -r '.url // empty')
[ -n "$APP_URL" ] && echo "App URL: $APP_URL"
