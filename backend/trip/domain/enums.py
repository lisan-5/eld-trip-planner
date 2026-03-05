"""Enumerations used in trip domain."""
from enum import Enum


class TripStatus(Enum):
    PLANNED = "planned"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
