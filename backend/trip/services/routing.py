import os
import requests

from trip.services.polyline import haversine_miles

ORS_DIRECTIONS = "https://api.openrouteservice.org/v2/directions/driving-car"


def _to_lonlat(latlng):
    lat, lng = latlng
    return [lng, lat]


def _interpolate(a, b, points: int):
    if points <= 1:
        return [a, b]
    out = []
    for i in range(points):
        t = i / float(points - 1)
        lat = a[0] + t * (b[0] - a[0])
        lng = a[1] + t * (b[1] - a[1])
        out.append([lat, lng])
    return out


def _fallback_route(start, pickup, end):
    # Straight-line approximation so the app still works even if ORS fails.
    leg1 = haversine_miles(start, pickup)
    leg2 = haversine_miles(pickup, end)
    distance_miles = float(leg1 + leg2)

    speed_mph = 55.0
    duration_minutes = float(distance_miles / max(1e-6, speed_mph) * 60.0)

    pts1 = _interpolate([start[0], start[1]], [pickup[0], pickup[1]], 25)
    pts2 = _interpolate([pickup[0], pickup[1]], [end[0], end[1]], 25)
    polyline_latlng = pts1 + pts2[1:]

    return {
        "distanceMiles": distance_miles,
        "durationMinutes": duration_minutes,
        "polyline": polyline_latlng,
        "steps": [],
    }


def ors_route(start, pickup, end):
    api_key = os.getenv("ORS_API_KEY", "")
    if (not api_key) or api_key.startswith("PASTE_"):
        return _fallback_route(start, pickup, end)

    coords = [_to_lonlat(start), _to_lonlat(pickup), _to_lonlat(end)]

    body = {
        "coordinates": coords,
        "instructions": True,
        "geometry": True,
        "geometry_simplify": False,
        "units": "mi",
    }

    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    timeout_s = float(os.getenv("ORS_TIMEOUT_SECONDS", "8"))

    try:
        r = requests.post(ORS_DIRECTIONS, json=body, headers=headers, timeout=timeout_s)
        if r.status_code >= 400:
            return _fallback_route(start, pickup, end)

        data = r.json()
    except Exception:
        return _fallback_route(start, pickup, end)

    if "features" not in data or not data["features"]:
        return _fallback_route(start, pickup, end)

    feature = data["features"][0]
    props = feature.get("properties", {})
    summary = props.get("summary", {})

    distance_miles = float(summary.get("distance", 0.0))
    duration_minutes = float(summary.get("duration", 0.0)) / 60.0

    coords_ll = feature.get("geometry", {}).get("coordinates", [])
    polyline_latlng = [[c[1], c[0]] for c in coords_ll] if coords_ll else []

    segments = props.get("segments", [])
    steps_out = []
    for seg in segments:
        for st in seg.get("steps", []):
            steps_out.append({
                "instruction": st.get("instruction", ""),
                "distanceMiles": float(st.get("distance", 0.0)) / 1609.34 if st.get("distance") else None,
                "durationMinutes": float(st.get("duration", 0.0)) / 60.0 if st.get("duration") else None,
                "type": st.get("type"),
            })

    return {
        "distanceMiles": distance_miles,
        "durationMinutes": duration_minutes,
        "polyline": polyline_latlng,
        "steps": steps_out,
    }