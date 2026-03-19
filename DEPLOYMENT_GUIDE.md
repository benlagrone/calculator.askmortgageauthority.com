# AMA Calculators Deployment Guide

This is the current production deployment guide for the Ask Mortgage Authority calculators app.

Project repo:

- `calculator.askmortgageauthority.com`

Canonical public host:

- `https://calculator.askmortgageauthority.com/`

Current production server:

- Contabo VPS at `89.117.151.145`

## Current Deployment State

The calculators app is already wired for controlled GitHub deployment.

A push to `main` now does this:

1. GitHub Actions builds the Docker image.
2. GitHub Actions smoke-tests the container.
3. GitHub Actions pushes the image to GHCR.
4. GitHub Actions dispatches the fortress deploy workflow.
5. `fortress-phronesis` pulls the pinned image on Contabo.
6. The live calculators container is recreated in place.
7. Local and public smoke checks run after deployment.

This means production deploys are now image-based and controlled through GitHub, not host-side source builds.

## The Two Repos Involved

### 1. Application repo

Repo:

- `https://github.com/benlagrone/calculator.askmortgageauthority.com`

Workflow:

- `.github/workflows/build-ama-calculators.yml`

Responsibilities:

1. build image
2. run smoke checks
3. push GHCR image
4. trigger deploy

### 2. Control-plane repo

Repo:

- `https://github.com/benlagrone/fortress-phronesis`

Workflow:

- `.github/workflows/deploy-ama-calculators.yml`

Responsibilities:

1. receive requested commit SHA
2. pull pinned image
3. redeploy the production service on Contabo
4. run local and public smoke checks

## Runtime Identity Kept Stable

The deployment preserves the existing live service identity:

- compose project: `fortress-phronesis`
- service: `calculators`
- container name: `calculators-app`
- host port: `18010`
- container port: `8000`

This is important because the host nginx config already proxies production traffic to `127.0.0.1:18010`.

## Image Naming

Images are published to:

- `ghcr.io/benlagrone/calculator.askmortgageauthority.com:sha-<commit>`
- `ghcr.io/benlagrone/calculator.askmortgageauthority.com:latest`

Production should always be thought of as deploying the SHA-tagged image, not `latest`.

## Build Pipeline

The build workflow performs these checks:

1. Python syntax smoke:
   - `python3 -m compileall server.py page_rendering.py`
2. Docker image build
3. Container smoke:
   - `GET /healthz`
   - `GET /Annual-Percentage-Rate`

Current limitation:

- there is not yet a dedicated automated test suite, so release gating is syntax check plus container smoke, not full application tests

## Deploy Pipeline

The deploy workflow uses the built commit SHA and does this on Contabo:

1. updates the clean fortress deploy checkout
2. logs Docker into GHCR if needed
3. pulls the exact image tag for that SHA
4. runs:
   - `docker compose -p fortress-phronesis -f docker-compose.calculators.yml pull calculators`
   - `docker compose -p fortress-phronesis -f docker-compose.calculators.yml up -d calculators`
5. verifies:
   - `http://127.0.0.1:18010/healthz`
   - `http://127.0.0.1:18010/Annual-Percentage-Rate`
   - `https://calculator.askmortgageauthority.com/healthz`
   - `https://calculator.askmortgageauthority.com/Annual-Percentage-Rate`

## What Happens On Push

Normal production path:

1. commit changes
2. push to `main`
3. wait for `Build AMA Calculators Image` to pass
4. GitHub auto-dispatches `Deploy AMA Calculators`
5. production is updated automatically if deploy smoke checks pass

This is now the standard deploy path.

## Manual Redeploy

If you need to redeploy a specific known-good commit without making a new app commit:

1. open GitHub Actions in `fortress-phronesis`
2. run `Deploy AMA Calculators`
3. set:
   - `environment=prod`
   - `source_sha=<full commit sha from calculator repo>`

This is the manual override path.

## Rollback

Rollback is a manual redeploy of an older image:

1. find the previous known-good calculator commit SHA
2. run `Deploy AMA Calculators` manually in `fortress-phronesis`
3. supply that older SHA

Rollback does not require rebuilding on the server.

## Secrets In Use

### In calculator repo

- `FORTRESS_WORKFLOW_TOKEN`

Purpose:

- dispatch the deploy workflow in `fortress-phronesis`

### In fortress `prod` environment

- `AMA_CALCULATORS_DEPLOY_HOST`
- `AMA_CALCULATORS_DEPLOY_USER`
- `AMA_CALCULATORS_DEPLOY_ROOT`
- `AMA_CALCULATORS_DEPLOY_SSH_KEY`
- `AMA_CALCULATORS_DEPLOY_KNOWN_HOSTS`
- `AMA_CALCULATORS_GHCR_READ_TOKEN`

Purpose:

- SSH into Contabo
- update the fortress deploy checkout
- pull private GHCR images

## Live Paths

Current live container:

- `calculators-app`

Current live compose file:

- `fortress-phronesis/docker-compose.calculators.yml`

Current fortress deploy root on server:

- `/root/workspace/fortress-phronesis-deploy`

Current local upstream:

- `http://127.0.0.1:18010`

## Validation Already Completed

This pipeline was validated live.

Successful build:

- calculators repo run `23274900267`

Successful deploy:

- fortress repo run `23274913787`

Live container after deploy:

- `calculators-app ghcr.io/benlagrone/calculator.askmortgageauthority.com:sha-65257e401361657db6cc194d36b8cdbd91c0d2b0`

Public health:

- `https://calculator.askmortgageauthority.com/healthz` returned `200`

## Important Hostname Note

The codebase and verified production host are singular:

- `calculator.askmortgageauthority.com`

There is also an nginx vhost for:

- `calculators.askmortgageauthority.com`

But as of March 18, 2026, that plural hostname did not resolve publicly from validation checks. The deployment pipeline is working; the unresolved item is DNS/public hostname configuration for the plural alias.

## Recommended Next Improvements

1. add a real automated test suite beyond syntax plus smoke
2. add branch protection requiring the build workflow on `main`
3. decide whether the plural hostname should resolve publicly or be removed
4. decide whether deploy concurrency should cancel older pending deploys on rapid pushes
