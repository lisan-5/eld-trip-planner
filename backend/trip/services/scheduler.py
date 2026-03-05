from datetime import datetime, timedelta, timezone
import math
import uuid

from trip.services.polyline import point_at_mile

# Simple HOS model for MVP:
# - 11h driving max per duty day
# - 14h duty window max (starts at first ON)
# - 30-min break after 8h driving since last break
# - 10h sleeper/off to reset daily clocks
# - 70h/8days cycle limit: input is current used. We subtract added ON+D from remaining.
# Assumptions from prompt:
# - 1 hour pickup and dropoff
# - fuel at least once every 1000 miles (we model as 30 mins ON)

def _id(prefix: str):
    return f"{prefix}_{uuid.uuid4().hex[:10]}"

def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

def _parse_start(start_time_iso: str):
    if not start_time_iso:
        # Default: today 06:30 local-ish (use UTC to keep simple)
        now = datetime.now(timezone.utc)
        return now.replace(hour=6, minute=30, second=0, microsecond=0)
    try:
        # Accept ISO string; if no tz, assume UTC
        dt = datetime.fromisoformat(start_time_iso.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        now = datetime.now(timezone.utc)
        return now.replace(hour=6, minute=30, second=0, microsecond=0)

def build_schedule(route, current, pickup, dropoff, cycle_used_hours: float, start_time_iso: str):
    distance = route["distanceMiles"]
    duration_min = route["durationMinutes"]

    poly = route.get("polyline") or []

    # Speed estimate based on route duration
    speed_mph = max(35.0, min(65.0, distance / max(0.1, duration_min / 60.0)))

    start_dt = _parse_start(start_time_iso)

    # Determine fuel stops (every 1000 miles)
    fuel_stops = []
    if distance > 1000:
        num = int(distance // 1000)
        for i in range(1, num + 1):
            fuel_stops.append(i * 1000.0)

    # We’ll create a coarse plan using “distance remaining” not per-step.
    # Phases:
    # - Pretrip ON 30m
    # - Drive to pickup (assume pickup at 1/3 of distance)
    # - Pickup ON 60m
    # - Drive to dropoff
    # - Dropoff ON 60m
    # - Sleep SB 10h (optional end)
    pickup_dist = distance * 0.33
    remaining_after_pickup = distance - pickup_dist

    events = []
    stops = []

    # stop markers
    stops.append({"id": _id("stop"), "type": "START", "label": "Current", "lat": current["lat"], "lng": current["lng"]})
    stops.append({"id": _id("stop"), "type": "PICKUP", "label": "Pickup", "lat": pickup["lat"], "lng": pickup["lng"]})
    stops.append({"id": _id("stop"), "type": "DROPOFF", "label": "Dropoff", "lat": dropoff["lat"], "lng": dropoff["lng"]})

    t = start_dt

    def add_event(type_, status, title, location_label, minutes, lat=None, lng=None, dist_so_far=None):
        nonlocal t
        s = t
        e = t + timedelta(minutes=minutes)
        events.append({
            "id": _id("evt"),
            "type": type_,
            "status": status,  # OFF / SB / D / ON
            "title": title,
            "locationLabel": location_label,
            "startISO": _iso(s),
            "endISO": _iso(e),
            "lat": lat,
            "lng": lng,
            "distanceMilesSoFar": dist_so_far,
        })
        t = e

    # Track clocks
    drive_today = 0
    on_duty_window = 0
    drive_since_break = 0

    def enforce_30min_break_if_needed():
        nonlocal drive_since_break, on_duty_window
        if drive_since_break >= 8 * 60:
            # approximate break location based on distance already traveled
            approx_mile = min(distance, max(0.0, (distance * 0.55)))  # decent default
            p = point_at_mile(poly, approx_mile)
            if p:
                stops.append({"id": _id("stop"), "type": "BREAK", "label": "30-min Break", "lat": p[0], "lng": p[1]})
            add_event("BREAK", "OFF", "30-minute break", "Rest area", 30, lat=(p[0] if p else None), lng=(p[1] if p else None))
            drive_since_break = 0
            on_duty_window += 30

    def enforce_daily_limits(next_drive_minutes):
        """
        If adding next_drive_minutes would exceed 11h driving or 14h window,
        insert 10h sleeper to reset.
        """
        nonlocal drive_today, on_duty_window, drive_since_break
        would_drive = drive_today + next_drive_minutes
        would_window = on_duty_window + next_drive_minutes

        if would_drive > 11 * 60 or would_window > 14 * 60:
            # End of day: sleeper/off duty 10h
            add_event("SLEEP", "SB", "Sleeper berth (10 hours)", "Overnight rest", 10 * 60)
            drive_today = 0
            on_duty_window = 0
            drive_since_break = 0

    # Pre-trip ON 30m
    add_event("START", "ON", "Pre-trip inspection", current["label"], 30, lat=current["lat"], lng=current["lng"])
    on_duty_window += 30

    # Drive to pickup
    drive_minutes_to_pickup = int((pickup_dist / speed_mph) * 60)
    # chunk driving to enforce break/daily
    driven = 0
    while driven < drive_minutes_to_pickup:
        enforce_30min_break_if_needed()
        chunk = min(120, drive_minutes_to_pickup - driven)  # 2h chunks
        enforce_daily_limits(chunk)
        add_event("PICKUP", "D", "Driving toward pickup", "En route", chunk, dist_so_far=(pickup_dist * (driven + chunk) / drive_minutes_to_pickup))
        driven += chunk
        drive_today += chunk
        on_duty_window += chunk
        drive_since_break += chunk

    # Pickup ON 60m
    add_event("PICKUP", "ON", "Pickup (1 hour)", pickup["label"], 60, lat=pickup["lat"], lng=pickup["lng"], dist_so_far=pickup_dist)
    on_duty_window += 60

    # Optional: fuel stop logic based on absolute distance (simple MVP)
    # If there’s a fuel stop between pickup and dropoff, insert it near midpoint
    if distance >= 1000:
        fuel_mile = 1000.0
        p = point_at_mile(poly, fuel_mile)
        if p:
            stops.append({
                "id": _id("stop"),
                "type": "FUEL",
                "label": f"Fuel stop (~{int(fuel_mile)} mi)",
                "lat": p[0],
                "lng": p[1],
            })

    # Drive to dropoff (remaining)
    drive_minutes_to_dropoff = int((remaining_after_pickup / speed_mph) * 60)
    driven2 = 0
    fueled = False
    while driven2 < drive_minutes_to_dropoff:
        enforce_30min_break_if_needed()

        # Insert a fuel stop once if required by distance
        if (not fueled) and distance >= 1000 and driven2 >= drive_minutes_to_dropoff * 0.5:
            add_event("FUEL", "ON", "Fueling (30 min)", "Fuel stop", 30)
            on_duty_window += 30
            fueled = True

        chunk = min(120, drive_minutes_to_dropoff - driven2)
        enforce_daily_limits(chunk)
        add_event("DROPOFF", "D", "Driving toward dropoff", "En route", chunk, dist_so_far=pickup_dist + (remaining_after_pickup * (driven2 + chunk) / drive_minutes_to_dropoff))
        driven2 += chunk
        drive_today += chunk
        on_duty_window += chunk
        drive_since_break += chunk

    # Dropoff ON 60m
    add_event("DROPOFF", "ON", "Dropoff (1 hour)", dropoff["label"], 60, lat=dropoff["lat"], lng=dropoff["lng"], dist_so_far=distance)
    on_duty_window += 60

    # End with sleeper (nice touch)
    add_event("SLEEP", "SB", "Sleeper berth (10 hours)", dropoff["label"], 10 * 60, lat=dropoff["lat"], lng=dropoff["lng"])
    # cycle tracking: ON+D count against 70h; OFF/SB do not.
    on_duty_and_driving_minutes = 0
    for e in events:
        if e["status"] in ("ON", "D"):
            s = datetime.fromisoformat(e["startISO"].replace("Z", "+00:00"))
            en = datetime.fromisoformat(e["endISO"].replace("Z", "+00:00"))
            on_duty_and_driving_minutes += int((en - s).total_seconds() / 60)

    added_hours = on_duty_and_driving_minutes / 60.0
    cycle_remaining = max(0.0, 70.0 - cycle_used_hours - added_hours)

    return {
        "stops": stops,
        "events": events,
        "meta": {
            "cycleUsedHours": cycle_used_hours,
            "cycleRemainingHours": cycle_remaining,
        },
    }
"""Scheduling utilities for trips (placeholder)."""


def schedule_trip(trip, when):
    """Schedule a trip for a given time (placeholder)."""
    return {"trip_id": getattr(trip, "id", None), "scheduled_for": when}
