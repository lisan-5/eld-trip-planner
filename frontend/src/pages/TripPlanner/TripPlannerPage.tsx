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
import DescriptionIcon from "@mui/icons-material/Description";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import TimerIcon from "@mui/icons-material/Timer";

export function TripPlannerPage() {
  return (
    <Stack spacing={2}>
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                  color: "primary.main",
                }}
              >
                <RouteIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5">Route setup</Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter locations and driver state to generate the full trip
                  workspace.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip size="small" label="Dispatch-grade" />
                <Chip size="small" color="secondary" label="HOS-aware" />
              </Stack>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.25,
              }}
            >
              {[
                {
                  label: "Routing",
                  text: "Current → pickup → dropoff with map-ready geometry.",
                },
                {
                  label: "Compliance",
                  text: "Cycle, break, and service-time assumptions applied automatically.",
                },
                {
                  label: "Outputs",
                  text: "Results include itinerary, logs, PDF, and compliance snapshot.",
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 1.5,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette.background.default,
                        theme.palette.mode === "dark" ? 0.3 : 0.62,
                      ),
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 760 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider />
            <TripForm />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FactCheckIcon color="primary" />
              <Typography variant="h6">At a glance</Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {[
                {
                  icon: <TimerIcon fontSize="small" color="primary" />,
                  title: "Compliance rules",
                  text: "11-hour drive, 14-hour duty window, and a 30-minute break after 8 hours of driving.",
                },
                {
                  icon: (
                    <LocalGasStationIcon fontSize="small" color="primary" />
                  ),
                  title: "Stops & realism",
                  text: "Pickup/dropoff service time plus fuel and rest timing make schedules feel operational.",
                },
                {
                  icon: <DescriptionIcon fontSize="small" color="primary" />,
                  title: "Outputs",
                  text: "Map route, itinerary timeline, compliance snapshot, daily logs, and PDF export.",
                },
              ].map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (t) =>
                      alpha(
                        t.palette.background.paper,
                        t.palette.mode === "dark" ? 0.3 : 0.55,
                      ),
                    p: 1.5,
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {item.icon}
                      <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
                        {item.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {item.text}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
