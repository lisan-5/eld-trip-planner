from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.http import HttpResponse

from concurrent.futures import ThreadPoolExecutor

from .serializers import PlanTripRequestSerializer
from trip.services.geocode import geocode_place
from trip.services.routing import ors_route
from trip.services.scheduler import build_schedule
from trip.services.logs import build_daily_logs
from trip.services.pdf_logs import build_logs_pdf


@api_view(["GET"])
def health(request):
    return Response({"ok": True})


@api_view(["POST"])
def plan_trip(request):
    ser = PlanTripRequestSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    current_q = data["currentLocation"]
    pickup_q = data["pickupLocation"]
    dropoff_q = data["dropoffLocation"]

    # 1) Geocode (parallel to reduce latency)
    with ThreadPoolExecutor(max_workers=3) as ex:
        fut_current = ex.submit(geocode_place, current_q)
        fut_pickup = ex.submit(geocode_place, pickup_q)
        fut_dropoff = ex.submit(geocode_place, dropoff_q)

        current = fut_current.result()
        pickup = fut_pickup.result()
        dropoff = fut_dropoff.result()

    if not current or not pickup or not dropoff:
        return Response(
            {"error": "Could not geocode one or more locations. Try a more specific city/state."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 2) Route (current -> pickup -> dropoff)
    route = ors_route(
        start=(current["lat"], current["lng"]),
        pickup=(pickup["lat"], pickup["lng"]),
        end=(dropoff["lat"], dropoff["lng"]),
    )

    # 3) Schedule + logs
    cycle_used = float(data["cycleUsedHours"])
    start_time_iso = data.get("startTimeISO") or ""

    schedule = build_schedule(
        route=route,
        current=current,
        pickup=pickup,
        dropoff=dropoff,
        cycle_used_hours=cycle_used,
        start_time_iso=start_time_iso,
    )

    logs = build_daily_logs(schedule["events"], route["distanceMiles"])

    response = {
        "route": route,
        "stops": schedule["stops"],
        "events": schedule["events"],
        "logs": logs,
        "meta": schedule["meta"],
    }
    return Response(response)


@api_view(["POST"])
def logs_pdf(request):
    payload = request.data
    if not isinstance(payload, dict):
        return Response(
            {"error": "Invalid payload"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        pdf_bytes = build_logs_pdf(payload)
    except Exception as e:
        return Response(
            {"error": f"Failed to build PDF: {e}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    res = HttpResponse(pdf_bytes, content_type="application/pdf")
    res["Content-Disposition"] = 'attachment; filename="eld-logs.pdf"'
    return res
"""API view placeholders for trip endpoints."""
from ..domain.types import Trip


def list_trips():
    """Return a list of trips (placeholder)."""
    return [Trip(id=1, origin="A", destination="B", status="planned")]


def get_trip(trip_id):
    """Return a single trip by id (placeholder)."""
    return Trip(id=trip_id, origin="A", destination="B", status="planned")
