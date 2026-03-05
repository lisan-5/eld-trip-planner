import math
from typing import List, Tuple, Optional

LatLng = Tuple[float, float]

def haversine_miles(a: LatLng, b: LatLng) -> float:
    # Earth radius in miles
    R = 3958.8
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    h = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    return 2 * R * math.asin(math.sqrt(h))

def cumulative_distances(polyline: List[LatLng]) -> List[float]:
    if not polyline:
        return []
    dists = [0.0]
    total = 0.0
    for i in range(1, len(polyline)):
        total += haversine_miles(polyline[i-1], polyline[i])
        dists.append(total)
    return dists

def point_at_mile(polyline: List[LatLng], mile: float) -> Optional[LatLng]:
    if not polyline:
        return None
    dists = cumulative_distances(polyline)
    total = dists[-1]
    mile = max(0.0, min(mile, total))

    # find segment containing mile
    for i in range(1, len(dists)):
        if dists[i] >= mile:
            prev_d = dists[i-1]
            seg_d = dists[i] - prev_d
            if seg_d <= 1e-6:
                return polyline[i]
            t = (mile - prev_d) / seg_d
            lat = polyline[i-1][0] + t * (polyline[i][0] - polyline[i-1][0])
            lng = polyline[i-1][1] + t * (polyline[i][1] - polyline[i-1][1])
            return (lat, lng)
    return polyline[-1]
