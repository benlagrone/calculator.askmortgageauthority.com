# Deployment Plan

## Recommended Approach

Deploy the calculators site as a single Dockerized FastAPI app behind a reverse proxy on `calculator.askmortgageauthority.com`.

This is the lowest-risk deployment model for the current codebase because:

- The app is mostly static HTML/CSS/JS, but it is not fully static in production.
- The currency converter depends on same-origin API routes at `/api/currencies` and `/api/rates` in [server.py](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/server.py#L112) and [server.py](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/server.py#L134).
- The SPA relies on server-side fallback routing so direct visits to calculator paths return `index.html` via [server.py](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/server.py#L172).
- Future financial-data requirements can be added to the existing FastAPI service without changing the deployment model.

## Current Deployment Constraints

- Runtime dependencies are installed directly in the image with no pinned lockfile in [Dockerfile](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/Dockerfile#L11).
- The Docker Compose healthcheck uses `curl` in [docker-compose.yml](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/docker-compose.yml#L10), but the current Python slim image does not install `curl` in [Dockerfile](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/Dockerfile#L2).
- Exchange-rate responses are cached on local disk under `cache/` in [server.py](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/server.py#L13), so the container needs a writable filesystem or mounted volume.
- The browser calls external services directly:
  - WordPress menu API in [js/menu.js](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/js/menu.js#L34)
  - Chat iframe in [js/chat.js](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/js/chat.js#L4)
  - Bootstrap, Font Awesome, Google Tag Manager, and a remote favicon in [index.html](/Users/benjaminlagrone/Local Sites/httpsaskmortgageauthoritycom/app/public/calculators/index.html#L11)

## Target Architecture

1. Source control remains the deployment source of truth.
2. CI builds a Docker image for each commit to the main branch.
3. Image is tagged with commit SHA and pushed to a registry.
4. Staging runs the same image on `staging-calculator.askmortgageauthority.com`.
5. Production runs the approved image behind Nginx or Caddy with TLS.
6. DNS is proxied through Cloudflare if already used for the main site.
7. A writable cache directory is mounted for exchange-rate caching.

## API Strategy

Keep the backend as a small financial-data service, not as a full server-rendered application.

Principles:

1. Keep deterministic calculator math in the frontend whenever possible.
2. Use the API for live data, reference data, caching, persistence, and protected business logic.
3. Version future endpoints under `/api/v1/...`.
4. Keep third-party provider integrations behind the API rather than scattering them across browser code.
5. Prefer additive endpoint growth over rewrites so the frontend can adopt new data features one calculator at a time.

## Future API Roadmap

Recommended expansion order:

1. `GET /api/v1/fx/currencies`
2. `GET /api/v1/fx/rates`
3. `GET /api/v1/reference/rates`
4. `GET /api/v1/reference/tax`
5. `GET /api/v1/reference/limits`
6. `GET /api/v1/lending/products`
7. `POST /api/v1/scenarios`

Suggested ownership by domain:

- `fx`
  - exchange rates
  - currency metadata
- `reference`
  - Treasury yields
  - CPI / inflation inputs
  - federal and state tax tables
  - Social Security limits, COLA, bend points
  - retirement distribution tables
- `lending`
  - mortgage rate sheets
  - product eligibility data
  - lender-specific pricing or fee assumptions
- `scenarios`
  - saved calculator runs
  - shareable links
  - exported reports or PDFs

Calculators that should stay frontend-only unless requirements change:

- amortization and payment calculators
- APR and refinance comparisons
- ROI, IRR, NPV, compound interest
- retirement projections based only on user-entered inputs

Calculators that are strong candidates for future API usage:

- currency conversion
- Treasury, inflation, and market-linked calculators
- tax and paycheck calculators that rely on annually updated tables
- Social Security and retirement rules calculators
- lender-product or pricing calculators

## Pre-Deployment Work

### Phase 1: Production Readiness

1. Add a pinned dependency file for `fastapi`, `uvicorn`, and `requests`.
2. Add a dedicated `/healthz` endpoint that does not depend on external APIs.
3. Fix the container healthcheck by either:
   - installing `curl`, or
   - replacing it with a Python-based or HTTP library healthcheck.
4. Move configurable values to environment variables:
   - chat iframe URL
   - Frankfurter base URL
   - exchangerate.host base URL
   - cache directory
5. Decide whether cache persistence matters:
   - if yes, mount a small volume
   - if no, use `/tmp` and accept cache loss on redeploy
6. Add structured access/error logging for the API container.
7. Reserve the `/api/v1` namespace before adding new endpoints so future growth stays organized.

### Phase 2: Security and Edge Controls

1. Terminate TLS at the reverse proxy.
2. Add canonical host redirects so all traffic ends on `https://calculator.askmortgageauthority.com`.
3. Add security headers at the proxy:
   - `Strict-Transport-Security`
   - `X-Content-Type-Options`
   - `Referrer-Policy`
   - a Content Security Policy that explicitly allows the CDN, GTM, WordPress API, and chat origin already used by the app
4. Confirm CORS behavior for the WordPress menu endpoint.
5. Restrict container exposure so only the reverse proxy is public.
6. Add rate limiting for future `/api/v1` endpoints if external or paid upstream providers are introduced.

### Phase 3: Release Safety

1. Stand up staging with the same reverse-proxy and TLS setup as production.
2. Add smoke tests for:
   - `/`
   - one direct calculator route such as `/Annual-Percentage-Rate`
   - `/api/currencies`
   - `/api/rates?from=USD&to=EUR&amount=100`
3. Verify the menu loads from WordPress and falls back to local JSON if it does not.
4. Verify the chat iframe loads and can exchange `postMessage` events.
5. Verify Google Tag Manager and other third-party assets are allowed by CSP.

## Deployment Pipeline

### CI

1. Trigger on merge to main.
2. Run a minimal validation step:
   - Python syntax check for `server.py`
   - container build
   - smoke test against a started container
3. Tag image as:
   - `calculators:<git-sha>`
   - optionally `calculators:staging` or `calculators:prod`
4. Push image to the registry.

### Staging Deployment

1. Pull the new image to staging.
2. Restart the service with the new image tag.
3. Run smoke tests against the staging URL.
4. Manually verify:
   - home page
   - at least three calculator routes
   - currency converter
   - mobile menu
   - chat iframe open/close behavior

### Production Deployment

1. Deploy during a low-traffic window.
2. Pull the exact image tag that passed staging.
3. Restart only the calculators service.
4. Run smoke tests immediately after deploy.
5. Monitor logs and uptime checks for 15 to 30 minutes before declaring success.

## Infrastructure Checklist

- DNS record for `calculator.askmortgageauthority.com`
- TLS certificate on the reverse proxy
- Docker host or container platform
- Image registry
- Reverse proxy config with SPA-friendly forwarding
- Writable cache path
- Log collection
- External egress allowed to:
  - `api.frankfurter.app`
  - `api.exchangerate.host`
  - `askmortgageauthority.com`
  - `chat.askmortgageauthority.com`
  - CDN and Google Tag Manager origins

## Rollback Plan

1. Keep at least the last two production image tags available.
2. Roll back by redeploying the previous known-good tag.
3. Do not change DNS during rollback unless the host itself failed.
4. If the issue is isolated to exchange-rate APIs, disable or hide the currency converter temporarily rather than rolling back the entire site.

## Monitoring

Monitor:

- `GET /`
- direct calculator route load
- `GET /api/currencies`
- `GET /api/rates?from=USD&to=EUR`
- container restarts
- 5xx rate
- reverse-proxy TLS errors

Alert if:

- uptime checks fail for 2 consecutive runs
- 5xx error rate spikes
- the app cannot reach upstream exchange-rate providers

## Recommended Order of Execution

Week 1:

1. Fix healthcheck and config externalization.
2. Add staging environment and smoke tests.
3. Add reverse-proxy config and TLS.
4. Reserve the versioned API path strategy for future endpoints.

Week 2:

1. Run staging soak for at least 1 day.
2. Deploy production from the exact staging image.
3. Monitor and tune cache, CSP, and third-party connectivity.

## Open Decisions

These need an owner before execution starts:

1. Hosting target: existing VM, container host, or managed platform.
2. Registry: Docker Hub, GHCR, or another private registry.
3. Reverse proxy: Nginx, Caddy, or existing ingress.
4. Whether exchange-rate cache should persist across deployments.
5. Whether WordPress menu data should stay remote or be vendored locally for reliability.
6. Which future financial data domains belong behind the API first: `reference`, `lending`, or `scenarios`.
