# AMA Calculators GitHub Pipeline Handoff

This document describes the controlled container deployment path for the Ask Mortgage Authority calculators app.

The app itself is canonicalized to:

- `https://calculator.askmortgageauthority.com/`

The Contabo host also has an alias vhost for:

- `https://calculators.askmortgageauthority.com/`

## Deployment Model

The release path is split across two repos:

1. `calculator.askmortgageauthority.com` builds and publishes the runtime image to GHCR.
2. A successful push-to-`main` build dispatches the deploy workflow in `fortress-phronesis`.
3. `fortress-phronesis` pulls the pinned image and redeploys the live calculators container on Contabo.

## Runtime Identity

The production deployment keeps the existing runtime identity:

- compose project: `fortress-phronesis`
- service: `calculators`
- container name: `calculators-app`
- host port: `18010`
- container port: `8000`

That means the image-based deploy replaces the current live service rather than creating a second stack.

## Build Workflow

Workflow file:

- `.github/workflows/build-ama-calculators.yml`

Behavior:

1. Triggers on push to `main` and manual dispatch.
2. Runs a Python syntax smoke check on `server.py` and `page_rendering.py`.
3. Builds the Docker image locally in GitHub Actions.
4. Runs container smoke checks against:
   - `/healthz`
   - `/Annual-Percentage-Rate`
5. Pushes:
   - `ghcr.io/benlagrone/calculator.askmortgageauthority.com:sha-<commit>`
   - `ghcr.io/benlagrone/calculator.askmortgageauthority.com:latest`
6. Uploads `build-metadata.json` as an artifact.
7. Automatically dispatches the fortress deploy workflow on successful pushes to `main`.

Current caveat:

- there is no dedicated test suite yet, so the active gates are syntax check plus container smoke

## Fortress Deploy Workflow

Workflow file:

- [`.github/workflows/deploy-ama-calculators.yml`](/Users/benjaminlagrone/Documents/projects/pericopeai.com/fortress-phronesis/.github/workflows/deploy-ama-calculators.yml)

Behavior:

1. Receives a `workflow_dispatch` call from the calculators repo after a green `main` build.
2. Can also be run manually for rollback or redeploy.
3. Pulls the pinned GHCR image.
4. Uses `docker compose -p fortress-phronesis -f docker-compose.calculators.yml`.
5. Recreates the existing `calculators-app` container in place.
6. Verifies:
   - `http://127.0.0.1:18010/healthz`
   - `http://127.0.0.1:18010/Annual-Percentage-Rate`
   - `https://calculator.askmortgageauthority.com/healthz`
   - `https://calculator.askmortgageauthority.com/Annual-Percentage-Rate`

## Required GitHub Secrets

### In `calculator.askmortgageauthority.com`

- `FORTRESS_WORKFLOW_TOKEN`

This token is used only to dispatch the fortress deploy workflow.

### In `fortress-phronesis` `prod` environment

- `AMA_CALCULATORS_DEPLOY_HOST`
- `AMA_CALCULATORS_DEPLOY_USER`
- `AMA_CALCULATORS_DEPLOY_ROOT`
- `AMA_CALCULATORS_DEPLOY_SSH_KEY`
- `AMA_CALCULATORS_DEPLOY_KNOWN_HOSTS`
- `AMA_CALCULATORS_GHCR_READ_TOKEN`

## Release Procedure

Normal path:

1. Push the desired commit to `main` in `calculator.askmortgageauthority.com`.
2. Wait for `Build AMA Calculators Image` to pass.
3. The fortress deploy is dispatched automatically.
4. Confirm the fortress deploy run passes all smoke checks.

Manual path:

1. Open `fortress-phronesis` Actions.
2. Run `Deploy AMA Calculators`.
3. Set:
   - `environment=prod`
   - `source_sha=<full calculators commit sha>`
4. Confirm the deploy run passes.

Rollback:

1. choose a previous known-good commit SHA
2. rerun `Deploy AMA Calculators` with that SHA

## Server Notes

Contabo currently serves the app through host nginx:

- `calculator.askmortgageauthority.com -> http://127.0.0.1:18010`
- `calculators.askmortgageauthority.com -> http://127.0.0.1:18010`

The live container already exists as:

- `calculators-app`

The image-based deployment keeps that identity instead of introducing a second public port or second calculator service.
