from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from concurrent.futures import ThreadPoolExecutor

from django.http import HttpResponse
from trip.services.pdf_logs import build_logs_pdf

from .serializers import PlanTripRequestSerializer
from trip.services.geocode import geocode_place
from trip.services.routing import ors_route
from trip.services.scheduler import build_schedule
from trip.services.logs import build_daily_logs


@api_view(["GET"])
def health(request):
    return Response({"ok": True})


@api_view(["POST"])
def plan_trip(request):
    ser = PlanTripRequestSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    try:
        current_q = data["currentLocation"]
        pickup_q = data["pickupLocation"]
        dropoff_q = data["dropoffLocation"]

        # Geocode concurrently to reduce total wait time on slow providers.
        with ThreadPoolExecutor(max_workers=3) as executor:
            current, pickup, dropoff = list(
                executor.map(geocode_place, [current_q, pickup_q, dropoff_q])
            )

        if not current or not pickup or not dropoff:
            return Response(
                {
                    "error": "Could not geocode one or more locations. Try a more specific city/state."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        route = ors_route(
            start=(current["lat"], current["lng"]),
            pickup=(pickup["lat"], pickup["lng"]),
            end=(dropoff["lat"], dropoff["lng"]),
        )

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

    except Exception as e:
        return Response(
            {"error": f"Trip planning failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def logs_pdf(request):
    payload = request.data
    pdf_bytes = build_logs_pdf(payload)

    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="eld-logs.pdf"'
    return response
