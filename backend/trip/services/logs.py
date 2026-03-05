from datetime import datetime, timezone
from collections import defaultdict

def _parse_iso(s: str) -> datetime:
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def _mins_since_midnight(dt: datetime) -> int:
    return dt.hour * 60 + dt.minute

def _date_iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")

def _fmt_time(dt: datetime) -> str:
    return dt.strftime("%H:%M")

def build_daily_logs(events, total_miles: float):
    # Split events into daily segments
    logs_by_date = {}
    miles_remaining = total_miles

    # Rough mileage allocation by driving time proportion
    total_drive_minutes = 0
    for e in events:
        if e["status"] == "D":
            s = _parse_iso(e["startISO"])
            en = _parse_iso(e["endISO"])
            total_drive_minutes += int((en - s).total_seconds() / 60)

    def alloc_miles(drive_mins):
        if total_drive_minutes <= 0:
            return 0
        return (drive_mins / total_drive_minutes) * total_miles

    daily_drive_mins = defaultdict(int)

    # First pass: build segments per day
    daily_segments = defaultdict(list)
    daily_remarks = defaultdict(list)

    for e in events:
        s = _parse_iso(e["startISO"])
        en = _parse_iso(e["endISO"])
        status = e["status"]

        # remark at every status change event
        daily_remarks[_date_iso(s)].append({
            "time": _fmt_time(s),
            "location": e.get("locationLabel") or "Unknown",
            "note": f"{status} — {e.get('title','')}".strip(),
        })

        # If event stays in same day, easy
        if _date_iso(s) == _date_iso(en):
            seg = {
                "status": status,
                "startMinute": _mins_since_midnight(s),
                "endMinute": _mins_since_midnight(en),
                "locationLabel": e.get("locationLabel"),
                "note": e.get("title"),
            }
            daily_segments[_date_iso(s)].append(seg)
            if status == "D":
                daily_drive_mins[_date_iso(s)] += (seg["endMinute"] - seg["startMinute"])
            continue

        # If crosses midnight: split
        day1 = _date_iso(s)
        day2 = _date_iso(en)

        seg1 = {
            "status": status,
            "startMinute": _mins_since_midnight(s),
            "endMinute": 1440,
            "locationLabel": e.get("locationLabel"),
            "note": e.get("title"),
        }
        seg2 = {
            "status": status,
            "startMinute": 0,
            "endMinute": _mins_since_midnight(en),
            "locationLabel": e.get("locationLabel"),
            "note": e.get("title"),
        }
        daily_segments[day1].append(seg1)
        daily_segments[day2].append(seg2)
        if status == "D":
            daily_drive_mins[day1] += (1440 - seg1["startMinute"])
            daily_drive_mins[day2] += seg2["endMinute"]

    # Second pass: totals + mileage per day
    dates = sorted(daily_segments.keys())
    logs = []

    for d in dates:
        segs = daily_segments[d]
        totals = {"OFF": 0, "SB": 0, "D": 0, "ON": 0}

        for seg in segs:
            mins = max(0, seg["endMinute"] - seg["startMinute"])
            totals[seg["status"]] += mins

        miles = round(alloc_miles(daily_drive_mins[d]))

        logs.append({
            "dateISO": d,
            "segments": segs,
            "totals": {
                "offDutyMins": totals["OFF"],
                "sleeperMins": totals["SB"],
                "drivingMins": totals["D"],
                "onDutyMins": totals["ON"],
            },
            "remarks": daily_remarks[d][:8],  # keep it clean
            "milesDriven": miles,
        })

    return logs
"""Lightweight logging helpers for trip services (placeholder)."""


def info(msg, **kwargs):
    print("INFO:", msg, kwargs)


def error(msg, **kwargs):
    print("ERROR:", msg, kwargs)
