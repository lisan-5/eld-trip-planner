import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import CoffeeIcon from "@mui/icons-material/Coffee";
import HotelIcon from "@mui/icons-material/Hotel";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import FlagIcon from "@mui/icons-material/Flag";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import type { PlanTripResponse, TimelineEvent } from "../../types/trip";

const statusLabel: Record<string, string> = {
  OFF: "Off duty",
  SB: "Sleeper",
  D: "Driving",
  ON: "On duty",
};

function fmtDuration(mins: number): string {
  if (!Number.isFinite(mins) || mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function eventIcon(e: TimelineEvent) {
  if (e.status === "D") return <DirectionsCarIcon fontSize="small" />;

  switch (String(e.type || "").toUpperCase()) {
    case "START":
      return <MyLocationIcon fontSize="small" />;
    case "PICKUP":
      return <Inventory2Icon fontSize="small" />;
    case "DROPOFF":
      return <FlagIcon fontSize="small" />;
    case "FUEL":
      return <LocalGasStationIcon fontSize="small" />;
    case "BREAK":
      return <CoffeeIcon fontSize="small" />;
    case "SLEEP":
      return <HotelIcon fontSize="small" />;
    default:
      return <DirectionsCarIcon fontSize="small" />;
  }
}

export function TimelineCard({
  events,
  meta,
  height,
}: {
  events: TimelineEvent[];
  meta: PlanTripResponse["meta"] | null;
  height?: number;
}) {
  return (
    <Card sx={{ height: height ?? 560, overflow: "hidden" }}>
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          minHeight: 0,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Typography variant="h6">Itinerary</Typography>
          {meta && (
            <Chip
              size="small"
              label={`${meta.cycleRemainingHours.toFixed(1)}h cycle remaining`}
              color={meta.cycleRemainingHours < 8 ? "warning" : "default"}
              variant={meta.cycleRemainingHours < 8 ? "filled" : "outlined"}
            />
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Stop list generated with HOS constraints and required breaks.
        </Typography>

        <Divider />

        {events.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">No events generated yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", pr: 1 }}>
            <Stack spacing={1.25}>
              {events.map((e, idx) => {
                const s = dayjs(e.startISO);
                const en = dayjs(e.endISO);
                const mins = Math.max(0, en.diff(s, "minute"));
                const showLine = idx < events.length - 1;

                return (
                  <Box key={e.id} sx={{ position: "relative", pl: 5 }}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: 13,
                        top: 22,
                        bottom: showLine ? -18 : "auto",
                        width: 2,
                        bgcolor: "divider",
                        opacity: 0.9,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: 4,
                        top: 10,
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        color: "text.primary",
                      }}
                    >
                      {eventIcon(e)}
                    </Box>

                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: (t) =>
                          alpha(
                            t.palette.background.paper,
                            t.palette.mode === "dark" ? 0.35 : 0.6,
                          ),
                        "&:hover": {
                          bgcolor: (t) =>
                            alpha(
                              t.palette.background.paper,
                              t.palette.mode === "dark" ? 0.5 : 0.78,
                            ),
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 760 }}
                        >
                          {e.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            variant="outlined"
                            label={fmtDuration(mins)}
                          />
                          <Chip
                            size="small"
                            label={statusLabel[e.status] ?? e.status}
                            variant="filled"
                          />
                        </Stack>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {s.format("MMM D, HH:mm")} → {en.format("HH:mm")}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {e.locationLabel}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default TimelineCard;
