"""Domain types for trips."""
from dataclasses import dataclass


@dataclass
class Trip:
    id: int
    origin: str
    destination: str
    status: str = "planned"
