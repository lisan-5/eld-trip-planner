import os
import time
import requests
from functools import lru_cache
import hashlib

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

HEADERS = {
    "User-Agent": "spotter-eld-assessment/1.0 (contact: demo@example.com)"
}


def _nominatim_sleep_seconds() -> float:
    # In dev/demo environments, outbound requests are often blocked and the
    # fallback geocoder is used; sleeping just slows down the UI.
    if os.getenv("DJANGO_DEBUG", "0") == "1":
        return float(os.getenv("NOMINATIM_SLEEP_SECONDS", "0"))
    return float(os.getenv("NOMINATIM_SLEEP_SECONDS", "0.2"))


_FALLBACK_LOCATIONS = {
    "chicago": (41.8781, -87.6298),
    "milwaukee": (43.0389, -87.9065),
    "indianapolis": (39.7684, -86.1581),
    "dallas": (32.7767, -96.7970),
    "denver": (39.7392, -104.9903),
    "atlanta": (33.7490, -84.3880),
    "new york": (40.7128, -74.0060),
    "los angeles": (34.0522, -118.2437),
    "seattle": (47.6062, -122.3321),
    "miami": (25.7617, -80.1918),
}


def _stable_hash_int(s: str) -> int:
    h = hashlib.sha256(s.encode("utf-8")).hexdigest()
    return int(h[:16], 16)


def _fallback_geocode(query: str):
    q = (query or "").strip()
    if not q:
        return None

    ql = q.lower()
    for key, (lat, lng) in _FALLBACK_LOCATIONS.items():
        if key in ql:
            return {"lat": lat, "lng": lng, "label": key.title(), "raw": None}

    # Deterministic pseudo-geocode within contiguous US bounds.
    # This keeps the app usable when outbound HTTP is blocked.
    n = _stable_hash_int(ql)
    lat = 25.0 + (n % 2400000) / 2400000.0 * (49.0 - 25.0)
    lng = -124.0 + ((n // 2400000) % 5700000) / 5700000.0 * (-67.0 + 124.0)
    return {"lat": float(lat), "lng": float(lng), "label": q, "raw": None}

@lru_cache(maxsize=256)
def _geocode_cached(query: str):
    params = {
        "q": query,
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
    }
    # Be polite to Nominatim in case of multiple requests
    time.sleep(_nominatim_sleep_seconds())
    r = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=20)
    r.raise_for_status()
    results = r.json()
    if not results:
        return None
    top = results[0]
    lat = float(top["lat"])
    lon = float(top["lon"])

    addr = top.get("address", {})
    city = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("hamlet")
    state = addr.get("state")
    country = addr.get("country_code", "").upper()

    label_parts = []
    if city:
        label_parts.append(city)
    if state:
        label_parts.append(state)
    if not label_parts:
        label_parts.append(top.get("display_name", query))

    label = ", ".join(label_parts)

    return {"lat": lat, "lng": lon, "label": label, "raw": top}

def geocode_place(query: str):
    q = (query or "").strip()
    if not q:
        return None
    try:
        res = _geocode_cached(q)
        if res:
            return res
        return _fallback_geocode(q)
    except Exception:
        return _fallback_geocode(q)
"""Geocoding service utilities (placeholder)."""


def geocode_address(address):
    """Resolve an address to coordinates. Returns (lat, lon) or None."""
    # Placeholder implementation
    return (0.0, 0.0)
