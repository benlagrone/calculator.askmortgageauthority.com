Mortgage Calculators (SPA + FastAPI)

This directory hosts a client-rendered calculators site with a small FastAPI backend. Most calculators run entirely in the browser, while the backend provides SPA-friendly routing plus API support for live or cached financial data such as currency conversion.

Key Pieces
- `index.html`: App shell; loads templates into `#app-content` based on the URL path.
- `templates/`: HTML fragments for each calculator (e.g., `Home.html`, `Annual-Percentage-Rate.html`).
- `js/main.js`: Client-side routing and template injection.
- `js/calcs.js`: Input handling, formatting, and calculator utilities.
- `server.py`: FastAPI app that serves static assets, provides SPA fallback routing, and exposes API endpoints used by data-backed calculators.
- `js/menu.js`: Loads the mega menu from WordPress (with `js/menu.json` fallback).
- `js/chat.js`: Injects a chatbot iframe; URL is configurable via a meta tag.
- `css/`: Styles for menu, chat, and calculators.
- `work/`: Local utilities for template cleanup.

Running Locally
- Install backend dependencies:
  - `python3 -m pip install -r requirements.txt`
- Full app, including API routes and direct calculator URLs:
  - `uvicorn server:app --host 0.0.0.0 --port 8000`
  - Open `http://localhost:8000/`
- Static-only smoke testing:
  - `python3 -m http.server 8000`
  - Use this only for basic asset checks; API-backed calculators and SPA fallback routes will not behave like production.
- Docker (local testing only):
  - `docker build -t calculators-local .`
  - `docker run --rm -p 8000:8000 calculators-local`
- Docker Compose (uniform start/stop/rebuild):
  - `docker compose up -d --build` (maps host `18010` to container `8000`)
  - `docker compose down`

Routing
Navigating to `/<Calculator-Name>` loads `/templates/<Calculator-Name>.html` into the app container. Example: `/Annual-Percentage-Rate`. In production-like environments, `server.py` returns `index.html` for unknown application routes so deep links work.

API
- `GET /healthz`: lightweight container and deployment health check.
- `GET /api/currencies`: returns currency metadata for the currency converter.
- `GET /api/rates?from=USD&to=EUR&amount=100`: returns converted amount plus cached rate metadata.
- The current API footprint is intentionally small and can be extended later for other financial-data needs.

Backend Configuration
- `CALCULATORS_CACHE_DIR`: overrides the cache directory for API responses.
- `CALCULATORS_CACHE_TTL_SECONDS`: overrides how long cached upstream data is considered fresh.
- `CALCULATORS_REQUEST_TIMEOUT_SECONDS`: overrides upstream request timeout behavior.
- `CALCULATORS_FRANKFURTER_URL`: overrides the primary FX provider base URL.
- `CALCULATORS_EXCHANGE_HOST_URL`: overrides the fallback FX provider base URL.

Chatbot URL
The chat iframe URL is read from a meta tag in `index.html`:

<meta name="chat-iframe-url" content="http://localhost:9000/static/chat.html">

- Override `content` per environment (e.g., a production URL) without changing JS.
- If the tag is absent, it falls back to `http://localhost:9000/static/chat.html`.

Notes
- jQuery is loaded once (footer) before `calcs.js` as it uses `$`.
- Most calculators are frontend-only; keep new APIs focused on live data, reference data, caching, or persistence.
- `.dockerignore` excludes large/unneeded files (e.g., `venv/`, archives) from the Docker build context.
- `.gitignore` now excludes `venv/`, archives, caches, and common artifacts.

Planning docs
- `FEATURE-ROADMAP.md`: product roadmap for new calculators and companion tools.
- `SEO-plan.md`: SEO and UI/UX roadmap for crawlability, content, and on-page improvements.
- `DEPLOYMENT_PLAN.md`: deployment, platform, and API roadmap.
- `INTAKE-PREQUAL-CHAT-PLAN.md`: product and implementation plan for calculator-driven intake, chat triage, and prequalification handoff.
