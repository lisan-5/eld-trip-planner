import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useTripStore } from "../../pages/TripPlanner/tripStore";

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
    .transform((v) => (v ? v : undefined)),
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
    navigate("/results");
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
            Locations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter city/state or a specific address.
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 34,
                display: "flex",
                justifyContent: "center",
                position: "relative",
                mt: 0.5,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 30,
                  bottom: -18,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 2,
                  borderRadius: 999,
                  bgcolor: "divider",
                  opacity: 0.8,
                },
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
                }}
              >
                <MyLocationIcon fontSize="small" color="primary" />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Current"
                placeholder="e.g., Chicago, IL"
                fullWidth
                {...register("currentLocation")}
                error={!!errors.currentLocation}
                helperText={errors.currentLocation?.message}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 34,
                display: "flex",
                justifyContent: "center",
                position: "relative",
                mt: 0.5,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 30,
                  bottom: -18,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 2,
                  borderRadius: 999,
                  bgcolor: "divider",
                  opacity: 0.8,
                },
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
                }}
              >
                <Inventory2Icon fontSize="small" color="primary" />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Pickup"
                placeholder="e.g., Milwaukee, WI"
                fullWidth
                {...register("pickupLocation")}
                error={!!errors.pickupLocation}
                helperText={errors.pickupLocation?.message}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 34,
                display: "flex",
                justifyContent: "center",
                position: "relative",
                mt: 0.5,
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
                }}
              >
                <FlagIcon fontSize="small" color="primary" />
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Dropoff"
                placeholder="e.g., Indianapolis, IN"
                fullWidth
                {...register("dropoffLocation")}
                error={!!errors.dropoffLocation}
                helperText={errors.dropoffLocation?.message}
              />
            </Box>
          </Stack>
        </Stack>

        <Divider />

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

        <Stack spacing={1.5}>
          <TextField
            label="Current cycle used (hrs)"
            fullWidth
            type="number"
            inputProps={{ step: "0.5" }}
            {...register("cycleUsedHours", { valueAsNumber: true })}
            error={!!errors.cycleUsedHours}
            helperText={errors.cycleUsedHours?.message}
          />

          <TextField
            label="Start time (optional)"
            fullWidth
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            {...register("startTimeISO")}
            helperText="Leave blank to start ‘now’ on the timeline."
          />
        </Stack>

        <Divider />

        <Box>
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
        </Box>

        <Alert severity="info" sx={{ borderRadius: 1 }}>
          Quality checks: 11/14/30 rules, fuel stops, and pickup/dropoff service
          time are enforced.
        </Alert>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="large"
            variant="contained"
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isSubmitting ? "Planning…" : "Plan trip"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default TripForm;
