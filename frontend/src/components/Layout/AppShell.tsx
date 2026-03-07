import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
  const { inputs } = useTripStore();
  const colorMode = useContext(ColorModeContext);
  const isPlanner = location.pathname === "/";
  const isResults = location.pathname.startsWith("/results");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        isolation: "isolate",
      }}
    >
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
            borderColor: {
              xs: "transparent",
              md: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === "dark" ? 0.28 : 0.18,
                ),
            },
            px: 2.25,
            py: 3,
            position: { xs: "relative", md: "sticky" },
            top: 0,
            height: { md: "100vh" },
            display: { md: "flex" },
            flexDirection: { md: "column" },
            justifyContent: { md: "flex-start" },
            overflow: "visible",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.22)} 0%, ${alpha("#160d07", 0.92)} 18%, ${alpha(theme.palette.background.paper, 0.88)} 100%)`
                : `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.36)} 0%, ${alpha("#fff3e6", 0.94)} 22%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: { md: "blur(18px)" },
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? `inset -1px 0 0 ${alpha(theme.palette.common.white, 0.03)}`
                : `inset -1px 0 0 ${alpha(theme.palette.primary.main, 0.06)}`,
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: (theme) =>
                `radial-gradient(460px 220px at 12% 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.16)} 0%, transparent 72%), linear-gradient(180deg, ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.03 : 0.22)} 0%, transparent 32%)`,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              mb: 2.5,
            }}
          >
            <Box
              className="brand-badge"
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                background: (theme) =>
                  `linear-gradient(145deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 60%, ${theme.palette.primary.dark} 100%)`,
                color: "primary.contrastText",
                boxShadow: (theme) =>
                  `0 18px 44px ${alpha(theme.palette.primary.main, 0.34)}`,
                flex: "0 0 auto",
              }}
            >
              <LocalShippingIcon className="brand-logo-icon" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.96)
                      : "rgba(72, 38, 6, 0.92)",
                }}
              >
                Spotter Atlas
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.68)
                      : "rgba(116, 72, 20, 0.72)",
                }}
              >
                Freight route intelligence
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
                  sx={{
                    border: "1px solid",
                    borderColor: (theme) =>
                      alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === "dark" ? 0.28 : 0.18,
                      ),
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette.common.white,
                        theme.palette.mode === "dark" ? 0.04 : 0.38,
                      ),
                  }}
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
              position: "relative",
              zIndex: 1,
              mb: 2,
              p: 1.9,
              borderRadius: 3,
              border: "1px solid",
              borderColor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === "dark" ? 0.18 : 0.14,
                ),
              bgcolor: (theme) =>
                alpha(
                  theme.palette.background.paper,
                  theme.palette.mode === "dark" ? 0.34 : 0.66,
                ),
              backgroundImage: (theme) =>
                `linear-gradient(150deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.14)} 0%, ${alpha(theme.palette.primary.light, theme.palette.mode === "dark" ? 0.1 : 0.08)} 36%, transparent 72%)`,
              boxShadow: (theme) =>
                `0 18px 40px ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.08)}`,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                display: "block",
                letterSpacing: "0.14em",
                color: (theme) => alpha(theme.palette.primary.main, 0.92),
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              Dispatch Overview
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.35 }}>
              Plan compliant routes with faster visual checks.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Map, itinerary, and ELD logs stay synced as you update trip
              details.
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gap: 1,
              mb: 2,
              gridTemplateColumns: { xs: "1fr 1fr", md: "1fr" },
            }}
          >
            <Button
              startIcon={<RouteIcon />}
              variant={isPlanner ? "contained" : "outlined"}
              onClick={() => navigate("/")}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                minHeight: 48,
                px: 1.5,
                ...(isPlanner
                  ? {
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 82%)`,
                      boxShadow: (theme) =>
                        `0 16px 34px ${alpha(theme.palette.primary.main, 0.28)}`,
                    }
                  : {
                      borderColor: (theme) =>
                        alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.24 : 0.16,
                        ),
                      color: "text.primary",
                      backgroundColor: (theme) =>
                        alpha(
                          theme.palette.common.white,
                          theme.palette.mode === "dark" ? 0.03 : 0.42,
                        ),
                    }),
              }}
            >
              Route setup
            </Button>
            <Button
              startIcon={<MapIcon />}
              variant={isResults ? "contained" : "outlined"}
              onClick={() => navigate("/results")}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                minHeight: 48,
                px: 1.5,
                ...(isResults
                  ? {
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 82%)`,
                      boxShadow: (theme) =>
                        `0 16px 34px ${alpha(theme.palette.primary.main, 0.28)}`,
                    }
                  : {
                      borderColor: (theme) =>
                        alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.24 : 0.16,
                        ),
                      color: "text.primary",
                      backgroundColor: (theme) =>
                        alpha(
                          theme.palette.common.white,
                          theme.palette.mode === "dark" ? 0.03 : 0.42,
                        ),
                    }),
              }}
            >
              Results
            </Button>
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              display: { xs: "none", md: "block" },
              borderRadius: 3,
              border: "1px solid",
              borderColor: (theme) =>
                alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === "dark" ? 0.14 : 0.1,
                ),
              bgcolor: (theme) =>
                alpha(
                  theme.palette.background.paper,
                  theme.palette.mode === "dark" ? 0.5 : 0.78,
                ),
              backgroundImage: (theme) =>
                `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.08)} 0%, transparent 48%)`,
              p: 2,
              mb: 2,
              boxShadow: (theme) =>
                `0 16px 36px ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.06)}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: "text.primary" }}
            >
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

          <Box
            aria-hidden
            sx={{
              position: "absolute",
              right: -80,
              bottom: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: (theme) =>
                `radial-gradient(circle, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.18)} 0%, transparent 68%)`,
              filter: "blur(12px)",
              pointerEvents: "none",
            }}
          />
        </Box>

        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 2, md: 3 },
            minWidth: 0,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? `radial-gradient(760px 280px at 78% 0%, ${alpha(theme.palette.primary.main, 0.07)} 0%, transparent 70%)`
                  : `radial-gradient(760px 280px at 78% 0%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
