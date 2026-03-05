import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RouteIcon from "@mui/icons-material/Route";
import MapIcon from "@mui/icons-material/Map";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTripStore } from "../../pages/TripPlanner/tripStore";
import { ColorModeContext } from "../../app/colorMode";
import { useContext } from "react";

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadSampleTrip } = useTripStore();
  const { inputs } = useTripStore();
  const colorMode = useContext(ColorModeContext);

  const onSample = () => {
    loadSampleTrip();
    navigate("/");
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
        }}
      >
        <Box
          sx={{
            borderRight: { xs: "none", md: "1px solid" },
            borderColor: { xs: "transparent", md: "divider" },
            px: 2,
            py: 3,
            position: { xs: "relative", md: "sticky" },
            top: 0,
            alignSelf: { md: "start" },
            height: { md: "100vh" },
            overflow: { md: "auto" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <LocalShippingIcon color="primary" />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 760 }}>
                Spotter ELD
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Trip Planner Console
              </Typography>
            </Box>

            <Tooltip
              title={colorMode?.mode === "dark" ? "Light mode" : "Dark mode"}
            >
              <span>
                <IconButton
                  size="small"
                  onClick={() => colorMode?.toggle()}
                  aria-label="Toggle dark mode"
                >
                  {colorMode?.mode === "dark" ? (
                    <LightModeIcon fontSize="small" />
                  ) : (
                    <DarkModeIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 1,
              mb: 2,
              gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" },
            }}
          >
            <Button
              startIcon={<RouteIcon />}
              variant={location.pathname === "/" ? "contained" : "outlined"}
              onClick={() => navigate("/")}
              fullWidth
            >
              Route setup
            </Button>
            <Button
              startIcon={<MapIcon />}
              variant={
                location.pathname.startsWith("/results")
                  ? "contained"
                  : "outlined"
              }
              onClick={() => navigate("/results")}
              fullWidth
            >
              Results
            </Button>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "block" },
              borderRadius: 1,
              bgcolor: "background.paper",
              p: 2,
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
              Trip summary
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Inputs currently loaded
            </Typography>

            <Box sx={{ mt: 1.5, display: "grid", gap: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Current
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  {inputs.currentLocation?.trim() || "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Pickup
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  {inputs.pickupLocation?.trim() || "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Dropoff
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  {inputs.dropoffLocation?.trim() || "—"}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Cycle used: <b>{inputs.cycleUsedHours ?? 0}h</b>
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            onClick={onSample}
            color="primary"
            variant="outlined"
            fullWidth
          >
            Load sample trip
          </Button>
        </Box>

        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 3 },
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
