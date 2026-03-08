import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
// replaced LocalShippingRoundedIcon with brand image
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useTripStore } from "../../pages/TripPlanner/tripStore";
import { planTripWithCache } from "../../api/trip";

const schema = z.object({
  currentLocation: z.string().min(2, "Enter a valid current location"),
  pickupLocation: z.string().min(2, "Enter a valid pickup location"),
  dropoffLocation: z.string().min(2, "Enter a valid dropoff location"),
  cycleUsedHours: z.coerce
    .number()
    .min(0, "Must be >= 0")
    .max(70, "Must be <= 70"),
  startTimeISO: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

type FormValues = z.infer<typeof schema>;
type FormInputValues = z.input<typeof schema>;

export function TripForm() {
  const navigate = useNavigate();
  const { inputs, setInputs } = useTripStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputValues, undefined, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentLocation: inputs.currentLocation,
      pickupLocation: inputs.pickupLocation,
      dropoffLocation: inputs.dropoffLocation,
      cycleUsedHours: inputs.cycleUsedHours,
      startTimeISO: inputs.startTimeISO,
    },
  });

  const onSubmit = (values: FormValues) => {
    setInputs(values);
    // Start trip planning immediately so the results page can render sooner.
    void planTripWithCache(values);
    navigate("/results");
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            background: (theme) =>
              `linear-gradient(145deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.12)} 0%, ${alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.6 : 0.9)} 54%, ${alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.1 : 0.06)} 100%)`,
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "primary.main",
                  }}
                >
                  Route briefing
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.35 }}>
                  Build a compliant freight run in one pass
                </Typography>
              </Box>
              <Chip
                size="small"
                label="Live route + logs"
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Enter the core trip details below and the planner will generate a
              route, stop timing, itinerary, compliance view, and daily logs.
            </Typography>
          </Stack>
        </Box>

        <Stack
          spacing={1.25}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              alpha(
                theme.palette.background.paper,
                theme.palette.mode === "dark" ? 0.42 : 0.76,
              ),
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 760 }}>
            Route setup
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use city/state or a more specific address if you want tighter map
            placement.
          </Typography>

          {[
            {
              key: "currentLocation",
              label: "Current location",
              placeholder: "e.g., Chicago, IL",
              caption: "Starting point for the trip",
              icon: <MyLocationIcon fontSize="small" color="primary" />,
              error: errors.currentLocation?.message,
            },
            {
              key: "pickupLocation",
              label: "Pickup stop",
              placeholder: "e.g., Milwaukee, WI",
              caption: "First freight service event",
              icon: <Inventory2Icon fontSize="small" color="primary" />,
              error: errors.pickupLocation?.message,
            },
            {
              key: "dropoffLocation",
              label: "Dropoff stop",
              placeholder: "e.g., Indianapolis, IN",
              caption: "Final delivery destination",
              icon: <FlagIcon fontSize="small" color="primary" />,
              error: errors.dropoffLocation?.message,
            },
          ].map((field, index, all) => (
            <Stack
              key={field.key}
              direction="row"
              spacing={1.25}
              alignItems="stretch"
            >
              <Box
                sx={{
                  width: 34,
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                  pt: 1,
                  "&::after":
                    index < all.length - 1
                      ? {
                          content: '""',
                          position: "absolute",
                          top: 34,
                          bottom: -18,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 2,
                          borderRadius: 999,
                          background: (theme) =>
                            `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.55)} 0%, ${alpha(theme.palette.secondary.main, 0.18)} 100%)`,
                        }
                      : undefined,
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: 2,
                  }}
                >
                  {field.icon}
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 1.25,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: (theme) =>
                    alpha(
                      theme.palette.background.default,
                      theme.palette.mode === "dark" ? 0.34 : 0.6,
                    ),
                }}
              >
                <Stack spacing={0.9}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 760 }}>
                      {field.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {field.caption}
                    </Typography>
                  </Box>

                  <TextField
                    placeholder={field.placeholder}
                    fullWidth
                    {...register(
                      field.key as
                        | "currentLocation"
                        | "pickupLocation"
                        | "dropoffLocation",
                    )}
                    error={!!field.error}
                    helperText={field.error}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {field.icon}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon color="action" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
              Driver state
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Used cycle hours helps validate feasibility.
          </Typography>
        </Box>

        <Box
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              alpha(
                theme.palette.background.paper,
                theme.palette.mode === "dark" ? 0.34 : 0.62,
              ),
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.25}
            alignItems="stretch"
          >
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Current cycle used (hrs)"
                fullWidth
                type="number"
                inputProps={{ step: "0.5" }}
                {...register("cycleUsedHours", { valueAsNumber: true })}
                error={!!errors.cycleUsedHours}
                helperText={
                  errors.cycleUsedHours?.message ??
                  "Used for feasibility and compliance checks."
                }
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <TextField
                label="Start time (optional)"
                fullWidth
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                {...register("startTimeISO")}
                helperText="Leave blank to start now on the timeline."
              />
            </Box>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              `linear-gradient(140deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.16)} 0%, ${alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.56 : 0.84)} 55%)`,
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              Generate the live route dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The plan opens map, itinerary, compliance, and logs together.
            </Typography>
          </Stack>

          <Button
            type="submit"
            disabled={isSubmitting}
            size="large"
            variant="contained"
            className="cta-pulse"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Box
                  component="img"
                  src="/logo.png"
                  alt="logo"
                  className="cta-icon"
                  sx={{ width: 20, height: 20, objectFit: "contain" }}
                />
              )
            }
            sx={{
              minWidth: { xs: "100%", sm: 220 },
              minHeight: 56,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: (theme) =>
                `0 20px 42px ${alpha(theme.palette.primary.main, 0.3)}`,
              px: 2.5,
              "& .cta-icon": {
                transition: "transform 160ms ease",
              },
              "&:hover .cta-icon": {
                transform: "translateX(2px)",
              },
              "&:active .cta-icon": {
                transform: "translateX(4px) rotate(-8deg)",
              },
            }}
          >
            {isSubmitting ? "Planning…" : "Plan trip"}
          </Button>
        </Stack>

        <Box
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: (theme) =>
              alpha(
                theme.palette.background.paper,
                theme.palette.mode === "dark" ? 0.28 : 0.56,
              ),
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <SettingsSuggestIcon color="action" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
              Assumptions
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Property-carrying driver on a 70hrs/8days cycle. Pickup/dropoff take
            1 hour each. Fuel is added at least once every 1,000 miles.
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1.25 }}
          >
            <Chip size="small" variant="outlined" label="11h drive" />
            <Chip size="small" variant="outlined" label="14h duty" />
            <Chip size="small" variant="outlined" label="30m break" />
          </Stack>
        </Box>

        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Quality checks: 11/14/30 rules, fuel stops, and pickup/dropoff service
          time are enforced.
        </Alert>
      </Stack>
    </Box>
  );
}

export default TripForm;
