import type { ReactNode } from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import BedtimeRoundedIcon from "@mui/icons-material/BedtimeRounded";
import LocalGasStationRoundedIcon from "@mui/icons-material/LocalGasStation";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import CoffeeRoundedIcon from "@mui/icons-material/CoffeeRounded";
import type { PlanTripResponse } from "../../types/trip";

function countByType(events: PlanTripResponse["events"], type: string) {
  return events.filter((event) => event.type === type).length;
}

export function ComplianceCard({ data }: { data: PlanTripResponse | null }) {
  if (!data) return null;

  const breakCount = countByType(data.events, "BREAK");
  const fuelCount = countByType(data.events, "FUEL");
  const sleepCount = countByType(data.events, "SLEEP");
  const logDays = data.logs.length;
  const cycleRemaining = data.meta.cycleRemainingHours;
  const statusTone = cycleRemaining < 8 ? "warning" : "success";

  return (
    <Card>
      <CardContent sx={{ py: 1.5 }}>
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 760 }}>
                Compliance snapshot
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Breaks, fuel, rest periods, and generated log coverage.
              </Typography>
            </Box>

            <Chip
              color={statusTone}
              variant={cycleRemaining < 8 ? "filled" : "outlined"}
              icon={
                cycleRemaining >= 8 ? (
                  <VerifiedRoundedIcon />
                ) : (
                  <WarningAmberRoundedIcon />
                )
              }
              label={`Remaining cycle: ${cycleRemaining.toFixed(1)}h`}
            />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1,
            }}
          >
            <Metric
              label="Breaks"
              value={`${breakCount}`}
              icon={<CoffeeRoundedIcon fontSize="small" />}
            />
            <Metric
              label="Fuel stops"
              value={`${fuelCount}`}
              icon={<LocalGasStationRoundedIcon fontSize="small" />}
            />
            <Metric
              label="Rest periods"
              value={`${sleepCount}`}
              icon={<BedtimeRoundedIcon fontSize="small" />}
            />
            <Metric
              label="Log days"
              value={`${logDays}`}
              icon={<EventNoteRoundedIcon fontSize="small" />}
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            Assumptions: property-carrying driver, 70hrs/8days, no adverse
            conditions, fueling at least once every 1,000 miles, and 1 hour each
            for pickup and dropoff.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Stack
      spacing={0.5}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: (theme) =>
          alpha(
            theme.palette.background.paper,
            theme.palette.mode === "dark" ? 0.42 : 0.7,
          ),
        minHeight: 88,
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box
          sx={{ color: "primary.main", display: "grid", placeItems: "center" }}
        >
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1" sx={{ fontWeight: 760 }}>
        {value}
      </Typography>
    </Stack>
  );
}
