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

function eventTone(event: TimelineEvent) {
  switch (String(event.type || "").toUpperCase()) {
    case "START":
      return { main: "success.main", soft: "success.light" };
    case "PICKUP":
      return { main: "info.main", soft: "info.light" };
    case "DROPOFF":
      return { main: "error.main", soft: "error.light" };
    case "FUEL":
      return { main: "secondary.main", soft: "secondary.light" };
    case "BREAK":
      return { main: "warning.main", soft: "warning.light" };
    case "SLEEP":
      return { main: "grey.500", soft: "grey.300" };
    default:
      return { main: "primary.main", soft: "primary.light" };
  }
}

function eventTypeLabel(event: TimelineEvent) {
  return String(event.type || event.status).replace("_", " ");
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

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            variant="outlined"
            label={`${events.length} events`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`${events.filter((e) => e.status === "D").length} driving legs`}
          />
          {meta && (
            <Chip
              size="small"
              color={meta.cycleRemainingHours < 8 ? "warning" : "default"}
              variant="outlined"
              label={`${meta.cycleUsedHours.toFixed(1)}h used this cycle`}
            />
          )}
        </Stack>

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
                const tone = eventTone(e);

                return (
                  <Box key={e.id} sx={{ position: "relative", pl: 5 }}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: 13,
                        top: 22,
                        bottom: showLine ? -18 : "auto",
                        width: 2,
                        bgcolor: tone.main,
                        opacity: 0.35,
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
                        bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
                        border: "1px solid",
                        borderColor: tone.main,
                        color: tone.main,
                        boxShadow: 2,
                      }}
                    >
                      {eventIcon(e)}
                    </Box>

                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: (t) => alpha(t.palette.text.primary, 0.08),
                        borderLeft: "4px solid",
                        borderLeftColor: tone.main,
                        bgcolor: (t) =>
                          alpha(
                            t.palette.background.paper,
                            t.palette.mode === "dark" ? 0.35 : 0.6,
                          ),
                        boxShadow: 1,
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
                            label={eventTypeLabel(e)}
                            sx={{
                              bgcolor: (t) =>
                                alpha(
                                  (t.palette as any)[tone.main.split(".")[0]]
                                    ?.main ?? t.palette.primary.main,
                                  t.palette.mode === "dark" ? 0.18 : 0.12,
                                ),
                              color: tone.main,
                            }}
                          />
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
                        Window: {s.format("MMM D, HH:mm")} →{" "}
                        {en.format("HH:mm")}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {e.locationLabel}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mt: 1 }}
                      >
                        {typeof e.distanceMilesSoFar === "number" && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${e.distanceMilesSoFar.toFixed(0)} mi so far`}
                          />
                        )}
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Status: ${statusLabel[e.status] ?? e.status}`}
                        />
                      </Stack>
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
