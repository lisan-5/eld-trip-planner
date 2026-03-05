from rest_framework import serializers


class PlanTripRequestSerializer(serializers.Serializer):
    currentLocation = serializers.CharField()
    pickupLocation = serializers.CharField()
    dropoffLocation = serializers.CharField()
    cycleUsedHours = serializers.FloatField(min_value=0, max_value=70)
    startTimeISO = serializers.CharField(required=False, allow_blank=True)


class PlanTripResponseSerializer(serializers.Serializer):
    # response is built manually; serializer mainly documents shape
    route = serializers.DictField()
    stops = serializers.ListField()
    events = serializers.ListField()
    logs = serializers.ListField()
    meta = serializers.DictField()
"""Serializers for trip API (placeholders)."""
from dataclasses import asdict


class TripSerializer:
    """Simple serializer placeholder for Trip dataclass-like objects."""

    @staticmethod
    def to_dict(obj):
        try:
            return asdict(obj)
        except Exception:
            return obj.__dict__ if hasattr(obj, "__dict__") else dict(obj)
