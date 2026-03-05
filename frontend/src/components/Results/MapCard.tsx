import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import {
  MapContainer,
  Polyline,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import type { RouteInfo, Stop } from "../../types/trip";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";

function markerIconFor(
  stopType: Stop["type"],
  color: string,
  label: string,
  theme: Theme,
) {
  // A lightweight marker that doesn't require external icon assets.
  // Using theme palette colors keeps us consistent with the app design.
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
    html: `
      <div
        aria-label="${stopType}"
        style="
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: ${color};
          border: 2px solid ${theme.palette.common.white};
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font: 700 11px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial;
          color: ${theme.palette.common.white};
          text-transform: uppercase;
        "
      >${label}</div>
    `,
  });
}

function stopMarker(stop: Stop, theme: Theme) {
  const t = String(stop.type || "").toUpperCase();
  switch (t) {
    case "START":
      return markerIconFor(stop.type, theme.palette.success.main, "S", theme);
    case "PICKUP":
      return markerIconFor(stop.type, theme.palette.info.main, "P", theme);
    case "DROPOFF":
      return markerIconFor(stop.type, theme.palette.error.main, "D", theme);
    case "BREAK":
      return markerIconFor(stop.type, theme.palette.warning.main, "B", theme);
    case "FUEL":
      return markerIconFor(stop.type, theme.palette.secondary.main, "F", theme);
    default:
      return markerIconFor(stop.type, theme.palette.primary.main, "•", theme);
  }
}

function centerOf(polyline: Array<[number, number]>) {
  if (!polyline.length) return { lat: 39.5, lng: -98.35 };
  const mid = polyline[Math.floor(polyline.length / 2)];
  return { lat: mid[0], lng: mid[1] };
}

function MapBindings({
  polyline,
  stops,
  onReady,
  onBounds,
}: {
  polyline: Array<[number, number]>;
  stops: Stop[];
  onReady: (map: L.Map) => void;
  onBounds: (bounds: L.LatLngBounds | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  useEffect(() => {
    const pts: Array<[number, number]> =
      polyline.length > 0
        ? polyline
        : stops.map((s) => [s.lat, s.lng] as [number, number]);

    if (pts.length < 2) {
      onBounds(null);
      return;
    }

    const bounds = L.latLngBounds(pts.map(([lat, lng]) => L.latLng(lat, lng)));
    onBounds(bounds);
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, onBounds, polyline, stops]);

  return null;
}

export function MapCard({
  route,
  stops,
  loading,
  height,
}: {
  route: RouteInfo | null;
  stops: Stop[];
  loading?: boolean;
  height?: number;
}) {
  const theme = useTheme<Theme>();
  const polyline = route?.polyline ?? [];
  const center = centerOf(polyline);
  const [showStops, setShowStops] = useState(true);
  const [map, setMap] = useState<L.Map | null>(null);
  const boundsRef = useRef<L.LatLngBounds | null>(null);

  const legend = useMemo(
    () => [
      { label: "Start", color: theme.palette.success.main, glyph: "S" },
      { label: "Pickup", color: theme.palette.info.main, glyph: "P" },
      { label: "Dropoff", color: theme.palette.error.main, glyph: "D" },
      { label: "Fuel", color: theme.palette.secondary.main, glyph: "F" },
      { label: "Break", color: theme.palette.warning.main, glyph: "B" },
    ],
    [theme],
  );

  return (
    <Card sx={{ height: height ?? 560 }}>
      <CardContent sx={{ height: "100%" }}>
        <Stack spacing={1} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Typography variant="h6">Route map</Typography>
            {route && (
              <Typography variant="body2" color="text.secondary">
                {route.distanceMiles.toFixed(0)} mi •{" "}
                {(route.durationMinutes / 60).toFixed(1)} hrs
              </Typography>
            )}
          </Stack>

          <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
            <MapContainer
              center={[center.lat, center.lng]}
              zoom={6}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {polyline.length > 0 && <Polyline positions={polyline} />}

              <MapBindings
                polyline={polyline}
                stops={stops}
                onReady={(m) => setMap(m)}
                onBounds={(b) => {
                  boundsRef.current = b;
                }}
              />

              {showStops &&
                stops.map((s) => (
                  <Marker
                    key={s.id}
                    position={[s.lat, s.lng]}
                    icon={stopMarker(s, theme)}
                  >
                    <Popup>
                      <strong>{s.label}</strong>
                      <div style={{ opacity: 0.8 }}>{s.type}</div>
                      {s.etaISO && (
                        <div style={{ opacity: 0.8 }}>ETA: {s.etaISO}</div>
                      )}
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 6000,
                width: 240,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: (t) =>
                  alpha(
                    t.palette.background.paper,
                    t.palette.mode === "dark" ? 0.72 : 0.78,
                  ),
                backdropFilter: "blur(12px)",
                p: 1.25,
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 760 }}>
                    Route overlay
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!map || !boundsRef.current}
                    onClick={() => {
                      if (!map || !boundsRef.current) return;
                      map.fitBounds(boundsRef.current, { padding: [24, 24] });
                    }}
                  >
                    Fit
                  </Button>
                </Stack>

                {route && (
                  <Typography variant="body2" color="text.secondary">
                    {route.distanceMiles.toFixed(0)} mi •{" "}
                    {(route.durationMinutes / 60).toFixed(1)} hrs
                  </Typography>
                )}

                <FormControlLabel
                  sx={{
                    m: 0,
                    "& .MuiFormControlLabel-label": { fontSize: 13 },
                  }}
                  control={
                    <Switch
                      size="small"
                      checked={showStops}
                      onChange={(e) => setShowStops(e.target.checked)}
                    />
                  }
                  label="Stop markers"
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 0.75,
                  }}
                >
                  {legend.map((l) => (
                    <Box
                      key={l.label}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                          bgcolor: l.color,
                          border: "2px solid",
                          borderColor: (t) =>
                            alpha(
                              t.palette.common.white,
                              t.palette.mode === "dark" ? 0.7 : 0.9,
                            ),
                          boxShadow: 3,
                          flex: "0 0 auto",
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {l.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Box>

            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (t) =>
                    alpha(
                      t.palette.background.paper,
                      t.palette.mode === "dark" ? 0.22 : 0.45,
                    ),
                  zIndex: 5000,
                  pointerEvents: "none",
                }}
              >
                <CircularProgress size={28} />
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default MapCard;
