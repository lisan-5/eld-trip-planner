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
import { TripForm } from "../../components/TripForm/TripForm";
import RouteIcon from "@mui/icons-material/Route";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import MapIcon from "@mui/icons-material/Map";
import DescriptionIcon from "@mui/icons-material/Description";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import TimerIcon from "@mui/icons-material/Timer";

export function TripPlannerPage() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 420px" },
        gap: 2,
        alignItems: "start",
      }}
    >
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <RouteIcon color="primary" />
              <Typography variant="h5">Route setup</Typography>
              <Chip size="small" label="Dispatch-grade" />
              <Chip size="small" color="secondary" label="HOS-aware" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Enter locations and driver state. We’ll generate a route, a stop
              schedule, and ELD-style daily logs.
            </Typography>
            <Divider />
            <TripForm />
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FactCheckIcon color="primary" />
                <Typography variant="h6">At a glance</Typography>
              </Stack>

              <Box
                sx={{
                  height: 160,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: (t) =>
                    alpha(
                      t.palette.background.paper,
                      t.palette.mode === "dark" ? 0.3 : 0.55,
                    ),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <MapIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  Route preview will render on Results.
                </Typography>
              </Box>

              <Divider />

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TimerIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
                    Compliance rules
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Enforces 11-hour drive, 14-hour duty window, and a 30-minute
                  break after 8 hours of driving.
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <LocalGasStationIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
                    Stops & realism
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Adds pickup/dropoff time and fuel stops so schedules and logs
                  look authentic.
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <DescriptionIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
                    Outputs
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Map route, itinerary timeline, daily log sheets, and a PDF
                  export.
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
