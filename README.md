Mortgage Calculators (Static SPA)

This directory hosts a static, client-rendered calculators site. It loads calculator templates dynamically and can be served by any static web server.

Key Pieces
- `index.html`: App shell; loads templates into `#app-content` based on the URL path.
- `templates/`: HTML fragments for each calculator (e.g., `Home.html`, `Annual-Percentage-Rate.html`).
- `js/main.js`: Client-side routing and template injection.
- `js/calcs.js`: Input handling, formatting, and calculator utilities.
- `js/menu.js`: Loads the mega menu from WordPress (with `js/menu.json` fallback).
- `js/chat.js`: Injects a chatbot iframe; URL is configurable via a meta tag.
- `css/`: Styles for menu, chat, and calculators.
- `work/`: Local utilities for template cleanup.

Running Locally
- Python HTTP server (no build):
  - `python3 -m http.server 8000`
  - Open `http://localhost:8000/`
- Docker (local testing only):
  - `docker build -t calculators-local .`
  - `docker run --rm -p 8000:8000 calculators-local`
- Docker Compose (uniform start/stop/rebuild):
  - `docker compose up -d --build` (maps host `18010` to container `8000`)
  - `docker compose down`

Routing
Navigating to `/<Calculator-Name>` loads `/templates/<Calculator-Name>.html` into the app container. Example: `/Annual-Percentage-Rate`.

Chatbot URL
The chat iframe URL is read from a meta tag in `index.html`:

<meta name="chat-iframe-url" content="http://localhost:9000/static/chat.html">

- Override `content` per environment (e.g., a production URL) without changing JS.
- If the tag is absent, it falls back to `http://localhost:9000/static/chat.html`.

Notes
- jQuery is loaded once (footer) before `calcs.js` as it uses `$`.
- `.dockerignore` excludes large/unneeded files (e.g., `venv/`, archives) from the Docker build context.
- `.gitignore` now excludes `venv/`, archives, caches, and common artifacts.
