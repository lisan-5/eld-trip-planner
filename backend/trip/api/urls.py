from django.urls import path
from .views import health, plan_trip, logs_pdf

urlpatterns = [
    path("health/", health),
    path("plan-trip/", plan_trip),
    path("logs-pdf/", logs_pdf),
]
"""API URL patterns (placeholder)."""


