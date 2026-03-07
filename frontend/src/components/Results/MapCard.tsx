import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  IconButton,
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
  Tooltip,
  useMap,
} from "react-leaflet";
import type { RouteInfo, Stop } from "../../types/trip";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

// image-based colored markers per stop type
function iconForType(type: string) {
  const base =
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/";
  let iconFile = "marker-icon-blue.png";

  if (type === "START") iconFile = "marker-icon-green.png";
  if (type === "PICKUP") iconFile = "marker-icon-gold.png";
  if (type === "DROPOFF") iconFile = "marker-icon-red.png";
  if (type === "BREAK") iconFile = "marker-icon-violet.png";
  if (type === "FUEL") iconFile = "marker-icon-orange.png";
  if (type === "SLEEP") iconFile = "marker-icon-grey.png";

  return new L.Icon({
    iconUrl: `${base}${iconFile}`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
}

function centerOf(polyline: Array<[number, number]>) {
  if (!polyline.length) return { lat: 39.5, lng: -98.35 };
  const mid = polyline[Math.floor(polyline.length / 2)];
  return { lat: mid[0], lng: mid[1] };
}

function withStartPoint(
  polyline: Array<[number, number]>,
  startStop: Stop | undefined,
) {
  if (!startStop) return polyline;
  const startPoint: [number, number] = [startStop.lat, startStop.lng];
  if (!polyline.length) return [startPoint];

  const first = polyline[0];
  const latDiff = Math.abs(first[0] - startPoint[0]);
  const lngDiff = Math.abs(first[1] - startPoint[1]);
  if (latDiff < 0.0001 && lngDiff < 0.0001) return polyline;

  return [startPoint, ...polyline];
}

function labelForType(type: Stop["type"]) {
  switch (type) {
    case "START":
      return "Trip start";
    case "PICKUP":
      return "Pickup";
    case "DROPOFF":
      return "Dropoff";
    case "BREAK":
      return "Break";
    case "FUEL":
      return "Fuel stop";
    case "SLEEP":
      return "Rest period";
    default:
      return type;
  }
}

function formatEta(etaISO?: string) {
  if (!etaISO) return null;
  const date = new Date(etaISO);
  if (Number.isNaN(date.getTime())) return etaISO;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function bearingDegrees(start: [number, number], end: [number, number]) {
  const latDiff = end[0] - start[0];
  const lngDiff = end[1] - start[1];
  return (Math.atan2(latDiff, lngDiff) * 180) / Math.PI;
}

function routeDirectionIcon(angle: number, theme: Theme) {
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div
        style="
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          transform: rotate(${angle}deg);
        "
      >
        <div
          style="
            width: 0;
            height: 0;
            border-top: 7px solid transparent;
            border-bottom: 7px solid transparent;
            border-left: 12px solid ${theme.palette.primary.main};
            filter: drop-shadow(0 2px 6px rgba(15, 23, 42, 0.22));
            opacity: 0.98;
          "
        ></div>
      </div>
    `,
  });
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
  const rawPolyline = route?.polyline ?? [];
  const startStop = stops.find((stop) => stop.type === "START");
  const polyline = useMemo(
    () => withStartPoint(rawPolyline, startStop),
    [rawPolyline, startStop],
  );
  const center = centerOf(polyline);
  const [showStops, setShowStops] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [map, setMap] = useState<L.Map | null>(null);
  const boundsRef = useRef<L.LatLngBounds | null>(null);

  const routeArrows = useMemo(() => {
    if (polyline.length < 2) return [];
    const step = Math.max(6, Math.floor(polyline.length / 6));
    const startIndex = Math.min(
      polyline.length - 1,
      Math.max(1, Math.floor(polyline.length / 12)),
    );
    const arrows: Array<{ position: [number, number]; angle: number }> = [];

    for (let index = startIndex; index < polyline.length; index += step) {
      const prev = polyline[index - 1];
      const point = polyline[index];
      if (!prev || !point) continue;
      arrows.push({
        position: point,
        angle: bearingDegrees(prev, point),
      });
    }

    return arrows;
  }, [polyline]);

  const legend = useMemo(
    () => [
      { label: "Start", color: theme.palette.success.main, glyph: "S" },
      { label: "Pickup", color: theme.palette.info.main, glyph: "P" },
      { label: "Dropoff", color: theme.palette.error.main, glyph: "D" },
      { label: "Fuel", color: theme.palette.secondary.main, glyph: "F" },
      { label: "Break", color: theme.palette.warning.main, glyph: "B" },
      { label: "Rest", color: theme.palette.grey[500], glyph: "R" },
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

              {polyline.length > 0 && (
                <>
                  <Polyline
                    positions={polyline}
                    pathOptions={{
                      color: theme.palette.common.white,
                      weight: 12,
                      opacity: theme.palette.mode === "dark" ? 0.12 : 0.42,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                  <Polyline
                    positions={polyline}
                    pathOptions={{
                      color: theme.palette.primary.main,
                      weight: 8,
                      opacity: 0.88,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                  <Polyline
                    positions={polyline}
                    pathOptions={{
                      color: alpha(theme.palette.primary.light, 0.7),
                      weight: 3,
                      opacity: 0.85,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                </>
              )}

              {routeArrows.map((arrow, index) => (
                <Marker
                  key={`route-arrow-${index}`}
                  position={arrow.position}
                  icon={routeDirectionIcon(arrow.angle, theme)}
                  interactive={false}
                />
              ))}

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
                    icon={iconForType(s.type ?? "")}
                  >
                    <Tooltip direction="top" offset={[0, -28]} opacity={1}>
                      <div>
                        <strong>{labelForType(s.type)}</strong>
                        <div>{s.label}</div>
                        {formatEta(s.etaISO) && (
                          <div>ETA: {formatEta(s.etaISO)}</div>
                        )}
                      </div>
                    </Tooltip>
                    <Popup>
                      <strong>{s.label}</strong>
                      <div style={{ opacity: 0.8 }}>{labelForType(s.type)}</div>
                      {s.etaISO && (
                        <div style={{ opacity: 0.8 }}>
                          ETA: {formatEta(s.etaISO)}
                        </div>
                      )}
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            <Box
              sx={{
                position: "absolute",
                top: { xs: 8, sm: 12 },
                right: { xs: 8, sm: 12 },
                zIndex: 6000,
              }}
            >
              {showOverlay ? (
                <Box
                  sx={{
                    width: { xs: 186, sm: 240 },
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (t) =>
                      alpha(
                        t.palette.background.paper,
                        t.palette.mode === "dark" ? 0.72 : 0.78,
                      ),
                    backdropFilter: "blur(12px)",
                    p: { xs: 1, sm: 1.25 },
                  }}
                >
                  <Stack spacing={0.75}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 760, fontSize: { xs: 13, sm: 14 } }}
                      >
                        Route overlay
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => setShowOverlay(false)}
                          aria-label="Hide route overlay"
                        >
                          <VisibilityOffRoundedIcon fontSize="small" />
                        </IconButton>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={!map || !boundsRef.current}
                          onClick={() => {
                            if (!map || !boundsRef.current) return;
                            map.fitBounds(boundsRef.current, {
                              padding: [24, 24],
                            });
                          }}
                        >
                          Fit
                        </Button>
                      </Stack>
                    </Stack>

                    {route && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: 12, sm: 14 } }}
                      >
                        {route.distanceMiles.toFixed(0)} mi •{" "}
                        {(route.durationMinutes / 60).toFixed(1)} hrs
                      </Typography>
                    )}

                    {stops.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {stops.length} mapped stops with hover info.
                      </Typography>
                    )}

                    <FormControlLabel
                      sx={{
                        m: 0,
                        "& .MuiFormControlLabel-label": { fontSize: 12.5 },
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
                            gap: 0.75,
                            minWidth: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
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
              ) : (
                <IconButton
                  size="small"
                  onClick={() => setShowOverlay(true)}
                  aria-label="Show route overlay"
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (t) =>
                      alpha(
                        t.palette.background.paper,
                        t.palette.mode === "dark" ? 0.8 : 0.88,
                      ),
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <VisibilityRoundedIcon fontSize="small" />
                </IconButton>
              )}
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
