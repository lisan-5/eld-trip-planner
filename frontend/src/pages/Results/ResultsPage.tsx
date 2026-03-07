import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../TripPlanner/tripStore";
import { planTrip } from "../../api/trip";
import { downloadLogsPdf } from "../../api/pdf";
import type { PlanTripResponse } from "../../types/trip";
import { MapCard } from "../../components/Results/MapCard";
import { TimelineCard } from "../../components/Results/TimelineCard";
import { LogsViewer } from "../../components/Results/LogsViewer";
import { ComplianceCard } from "../../components/Results/ComplianceCard";

function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: (t) =>
          alpha(
            t.palette.background.paper,
            t.palette.mode === "dark" ? 0.55 : 0.55,
          ),
        pointerEvents: "none",
        zIndex: 10,
        borderRadius: 1,
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { inputs } = useTripStore();
  const [data, setData] = useState<PlanTripResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const hasInputs = useMemo(() => {
    return (
      inputs.currentLocation.trim() &&
      inputs.pickupLocation.trim() &&
      inputs.dropoffLocation.trim()
    );
  }, [inputs]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!hasInputs) return;
        setLoading(true);
        setError(null);

        const res = await planTrip(inputs);
        if (!alive) return;
        setData(res);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to plan trip");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [hasInputs, inputs]);

  const pdfPayload = useMemo(() => {
    if (!data) return null;
    return {
      route: data.route,
      logs: data.logs,
      meta: data.meta,
    };
  }, [data]);

  const showSkeleton = loading && !data;

  if (!hasInputs) {
    const missing: Array<{ label: string; value: string }> = [
      { label: "Current", value: inputs.currentLocation },
      { label: "Pickup", value: inputs.pickupLocation },
      { label: "Dropoff", value: inputs.dropoffLocation },
    ].filter((x) => !x.value?.trim());

    return (
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ReportProblemOutlinedIcon color="warning" />
              <Typography variant="h6">Results need trip inputs</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Add your current location, pickup, and dropoff to generate a map
              route, itinerary, and ELD logs.
            </Typography>

            {missing.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {missing.map((m) => (
                  <Chip
                    key={m.label}
                    label={`${m.label} missing`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            )}

            <Box>
              <Button
                onClick={() => navigate("/")}
                startIcon={<ArrowBackIcon />}
              >
                Go to Route setup
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: (t) =>
            alpha(
              t.palette.background.paper,
              t.palette.mode === "dark" ? 0.72 : 0.7,
            ),
          backdropFilter: "blur(12px)",
          p: 2,
          backgroundImage: (t) =>
            `linear-gradient(140deg, ${alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.18 : 0.1)} 0%, transparent 42%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ md: "center" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5">Trip summary</Typography>
            <Typography variant="body2" color="text.secondary">
              Dispatch console view of route, schedule, and logs.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {showSkeleton ? (
              <>
                <Skeleton variant="rounded" width={110} height={28} />
                <Skeleton variant="rounded" width={110} height={28} />
                <Skeleton variant="rounded" width={160} height={28} />
                <Skeleton variant="rounded" width={90} height={28} />
              </>
            ) : (
              <>
                <Chip
                  label={`${(data?.route?.distanceMiles ?? 0).toFixed(0)} mi`}
                  variant="outlined"
                />
                <Chip
                  label={`${((data?.route?.durationMinutes ?? 0) / 60).toFixed(1)} hrs`}
                  variant="outlined"
                />
                <Chip
                  label={`${(data?.meta?.cycleRemainingHours ?? 0).toFixed(1)}h cycle remaining`}
                  variant="outlined"
                  color={
                    (data?.meta?.cycleRemainingHours ?? 0) < 8
                      ? "warning"
                      : "default"
                  }
                />
                <Chip
                  label={`${data?.logs?.length ?? 0} day${(data?.logs?.length ?? 0) === 1 ? "" : "s"}`}
                  variant="outlined"
                />
              </>
            )}
          </Stack>

          <Button
            variant="contained"
            startIcon={
              downloadingPdf ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DownloadIcon />
              )
            }
            disabled={!pdfPayload || downloadingPdf}
            onClick={async () => {
              if (!pdfPayload) return;
              try {
                setDownloadingPdf(true);
                await downloadLogsPdf(pdfPayload);
              } catch (e) {
                console.error(e);
                window.alert("Failed to download PDF");
              } finally {
                setDownloadingPdf(false);
              }
            }}
          >
            {downloadingPdf ? "Preparing…" : "Download PDF"}
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {data && <ComplianceCard data={data} />}

      <Stack spacing={2}>
        {/* 1) Map */}
        <Box sx={{ position: "relative", minWidth: 0 }}>
          {showSkeleton ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: (t) =>
                  alpha(
                    t.palette.background.paper,
                    t.palette.mode === "dark" ? 0.4 : 0.55,
                  ),
                p: 2,
                height: { xs: 420, md: 560 },
              }}
            >
              <Skeleton variant="text" width={140} />
              <Skeleton variant="text" width={220} />
              <Skeleton variant="rounded" height={320} sx={{ mt: 1 }} />
            </Box>
          ) : (
            <MapCard
              route={data?.route ?? null}
              stops={data?.stops ?? []}
              loading={loading}
              height={560}
            />
          )}
        </Box>

        {/* 2) Itinerary */}
        <Box sx={{ position: "relative", minWidth: 0 }}>
          {showSkeleton ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: (t) =>
                  alpha(
                    t.palette.background.paper,
                    t.palette.mode === "dark" ? 0.4 : 0.55,
                  ),
                p: 2,
                height: { xs: 420, md: 560 },
              }}
            >
              <Skeleton variant="text" width={140} />
              <Skeleton variant="text" width={260} />
              <Skeleton variant="rounded" height={320} sx={{ mt: 1 }} />
            </Box>
          ) : (
            <>
              <TimelineCard
                events={data?.events ?? []}
                meta={data?.meta ?? null}
                height={560}
              />
              <LoadingOverlay show={loading} />
            </>
          )}
        </Box>

        {/* 3) Logs */}
        <Box sx={{ position: "relative", minWidth: 0 }}>
          {showSkeleton ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: (t) =>
                  alpha(
                    t.palette.background.paper,
                    t.palette.mode === "dark" ? 0.4 : 0.55,
                  ),
                p: 2,
              }}
            >
              <Skeleton variant="text" width={160} />
              <Skeleton variant="rounded" height={260} sx={{ mt: 1 }} />
            </Box>
          ) : (
            <>
              <LogsViewer logs={data?.logs ?? []} pdfPayload={pdfPayload} />
              <LoadingOverlay show={loading} />
            </>
          )}
        </Box>
      </Stack>
    </Stack>
  );
}
