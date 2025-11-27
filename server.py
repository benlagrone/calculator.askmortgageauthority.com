import json
import os
import time
from pathlib import Path
from typing import Dict, Optional

import requests
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

APP_DIR = Path(__file__).resolve().parent
CACHE_DIR = APP_DIR / "cache"
CACHE_DIR.mkdir(exist_ok=True)

# TTL for rate caching (in seconds)
CACHE_TTL = 24 * 60 * 60  # 1 day

FRANKFURTER_URL = "https://api.frankfurter.app"
EXCHANGE_HOST_URL = "https://api.exchangerate.host"

app = FastAPI()


def load_json(path: Path) -> Optional[dict]:
    if not path.exists():
        return None
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def save_json(path: Path, data: dict) -> None:
    try:
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f)
    except Exception:
        pass


def is_fresh(path: Path, ttl: int) -> bool:
    if not path.exists():
        return False
    return time.time() - path.stat().st_mtime < ttl


def fetch_frankfurter_currencies() -> Dict[str, str]:
    resp = requests.get(f"{FRANKFURTER_URL}/currencies", timeout=10)
    resp.raise_for_status()
    return resp.json()


def fetch_rate_frankfurter(from_code: str, to_code: str) -> Optional[float]:
    resp = requests.get(
        f"{FRANKFURTER_URL}/latest",
        params={"from": from_code, "to": to_code},
        timeout=10,
    )
    if resp.status_code != 200:
        return None
    data = resp.json()
    rates = data.get("rates") or {}
    rate = rates.get(to_code.upper())
    return rate


def fetch_rate_exchangerate_host(from_code: str, to_code: str) -> Optional[float]:
    resp = requests.get(
        f"{EXCHANGE_HOST_URL}/convert",
        params={"from": from_code, "to": to_code},
        timeout=10,
    )
    if resp.status_code != 200:
        return None
    data = resp.json()
    rate = data.get("info", {}).get("rate") or data.get("result")
    return rate


def get_rate(from_code: str, to_code: str) -> Dict[str, str]:
    today = time.strftime("%Y-%m-%d")
    cache_file = CACHE_DIR / f"rate-{from_code}-{to_code}-{today}.json"

    if is_fresh(cache_file, CACHE_TTL):
        cached = load_json(cache_file)
        if cached and "rate" in cached:
            return cached

    rate = fetch_rate_frankfurter(from_code, to_code)
    source = "frankfurter"

    if rate is None:
        rate = fetch_rate_exchangerate_host(from_code, to_code)
        source = "exchangerate.host"

    if rate is None:
        raise HTTPException(status_code=502, detail="Could not fetch rate")

    payload = {
        "from": from_code,
        "to": to_code,
        "rate": rate,
        "source": source,
        "fetched_at": int(time.time()),
    }
    save_json(cache_file, payload)
    return payload


@app.get("/api/currencies")
def currencies():
    cache_file = CACHE_DIR / "currencies.json"
    if is_fresh(cache_file, CACHE_TTL):
        cached = load_json(cache_file)
        if cached:
            return cached

    data = None
    try:
        data = fetch_frankfurter_currencies()
        save_json(cache_file, data)
    except Exception:
        if cache_file.exists():
            cached = load_json(cache_file)
            if cached:
                data = cached
    if data is None:
        raise HTTPException(status_code=502, detail="Could not fetch currencies")
    return data


@app.get("/api/rates")
def rate(
    from_currency: str = Query(..., alias="from"),
    to_currency: str = Query(..., alias="to"),
    amount: float = 1.0,
):
    from_code = from_currency.upper()
    to_code = to_currency.upper()
    info = get_rate(from_code, to_code)
    rate_value = info["rate"]
    converted = amount * rate_value
    reverse = 1 / rate_value if rate_value else None
    reverse_converted = amount * reverse if reverse else None
    return {
        "from": from_code,
        "to": to_code,
        "amount": amount,
        "rate": rate_value,
        "converted": converted,
        "reverse_rate": reverse,
        "reverse_converted": reverse_converted,
        "source": info.get("source"),
        "fetched_at": info.get("fetched_at"),
    }


# Serve static files
app.mount("/assets", StaticFiles(directory=APP_DIR / "assets"), name="assets")
app.mount("/css", StaticFiles(directory=APP_DIR / "css"), name="css")
app.mount("/js", StaticFiles(directory=APP_DIR / "js"), name="js")
app.mount("/templates", StaticFiles(directory=APP_DIR / "templates"), name="templates")


@app.get("/")
def root():
    return FileResponse(APP_DIR / "index.html")


@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    # Serve real files if they exist; otherwise, fall back to SPA entry.
    candidate = (APP_DIR / full_path).resolve()
    try:
        candidate.relative_to(APP_DIR)
    except ValueError:
        # Security: path traversal -> serve index
        return FileResponse(APP_DIR / "index.html")

    if candidate.exists() and candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(APP_DIR / "index.html")
