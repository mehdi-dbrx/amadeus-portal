# Deploy airops-portal to Databricks Apps

Deploy the portal as a Databricks App to the **same workspace and PAT** as amadeus-ground.

## Prerequisites

- **Databricks CLI** installed and authenticated (same profile you use for amadeus-ground).
- **`.env.local`** with `DATABRICKS_HOST`, `DATABRICKS_TOKEN`, and `DBX_APP_NAME` (e.g. `airops-portal`). You can copy amadeus-ground’s `.env.local` and set `DBX_APP_NAME=airops-portal`.
- **Dynamic customer logo (optional):** Set `BRANDFETCH_CLIENT_ID` (and optionally `BRANDFETCH_API_KEY` for fallback) in the app’s environment. Users can then set a “Brand name” (e.g. `Amadeus`) in Settings; the logo is fetched via [Brandfetch Brand Search API](https://docs.brandfetch.com/reference/brand-search-api) (by company name).

## Quick deploy

From the project root:

```bash
./deploy/deploy.sh
```

Or with a specific target and app name (from env):

```bash
DBX_APP_NAME=airops-portal DEPLOY_TARGET=airops ./deploy/deploy.sh
```

The script will:

1. Optionally sync `databricks.yml` from `.env.local` (app name).
2. Bind the existing app if it already exists (avoids "App already exists" errors).
3. Validate and deploy the bundle.
4. Start the app and print its URL.

## Same workspace and PAT

- Use the **same** `databricks` CLI profile (host + token) as for amadeus-ground so deployments go to the same workspace.
- Use a **different** app name (e.g. `airops-portal`) so it does not clash with `agent-airops`.
- If you use the sync script, keep the same `DATABRICKS_HOST` and `DATABRICKS_TOKEN` in `.env.local` as in amadeus-ground; only `DBX_APP_NAME` should differ.

## Sync app name from .env.local

To update the app name in `databricks.yml` from `DBX_APP_NAME`:

```bash
python deploy/sync_databricks_yml_from_env.py
# or
uv run python deploy/sync_databricks_yml_from_env.py
```

Use `--dry-run` to see changes without writing.

## If the app already exists

If deploy fails with "App already exists", the script will try to bind automatically. To bind manually:

```bash
databricks bundle deployment bind airops_portal <APP_NAME> -t airops --auto-approve
```

Then run `./deploy/deploy.sh` again.

## Files

| File | Purpose |
|------|---------|
| `deploy.sh` | Main deploy script (sync, bind, validate, deploy, run). |
| `sync_databricks_yml_from_env.py` | Writes app name in `databricks.yml` from `DBX_APP_NAME`. |
| `../app.yaml` | App runtime (Node 20, `npm run start`). |
| `../databricks.yml` | Bundle and app definition; target `airops`. |
