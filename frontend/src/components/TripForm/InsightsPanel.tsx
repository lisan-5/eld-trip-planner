import { Card, CardContent, Stack, Typography } from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import FactCheckIcon from "@mui/icons-material/FactCheck";

export function InsightsPanel() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">What the planner will enforce</Typography>

        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TimerIcon color="primary" />
            <Typography variant="subtitle1">11/14/30 Rules</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Max 11 hours driving per duty day, 14-hour duty window, and a
            30-minute break after 8 hours of cumulative driving.
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <LocalGasStationIcon color="primary" />
            <Typography variant="subtitle1">Fuel every 1,000 miles</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Adds fueling stops as on-duty-not-driving blocks so the logs look
            authentic.
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <FactCheckIcon color="primary" />
            <Typography variant="subtitle1">Daily log sheets</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            The app will draw the duty status grid (OFF / SB / D / ON),
            calculate totals, and add remarks at status changes.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default InsightsPanel;
