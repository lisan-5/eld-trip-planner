import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Slider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import type { DailyLog, PlanTripResponse, RouteInfo } from "../../types/trip";
import { downloadLogsPdf } from "../../api/pdf";
import { EldLogSheet } from "./EldLogSheet";

type LogsPdfPayload = {
  route: RouteInfo;
  logs: DailyLog[];
  meta: PlanTripResponse["meta"];
};

export function LogsViewer({
  logs,
  pdfPayload,
}: {
  logs: DailyLog[];
  pdfPayload?: LogsPdfPayload | null;
}) {
  const [idx, setIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState(1);

  const safeIdx = useMemo(() => {
    if (!logs.length) return 0;
    return Math.max(0, Math.min(idx, logs.length - 1));
  }, [idx, logs.length]);

  const selectedLog = logs[safeIdx] ?? null;
  const summaryChips = selectedLog
    ? [
        { label: `Date ${selectedLog.dateISO}` },
        { label: `${selectedLog.milesDriven} mi driven` },
        {
          label: `${((selectedLog.totals.drivingMins + selectedLog.totals.onDutyMins) / 60).toFixed(1)}h on duty`,
        },
      ]
    : [];

  return (
    <Card
      sx={{
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.78)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
            : undefined,
        border: (theme) =>
          theme.palette.mode === "dark"
            ? `1px solid ${alpha(theme.palette.common.white, 0.08)}`
            : undefined,
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6">Logs viewer</Typography>
              <Typography variant="body2" color="text.secondary">
                Review ELD-style daily logs ({logs.length} day
                {logs.length === 1 ? "" : "s"}).
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="flex-end"
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ minWidth: { sm: 220 } }}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    setZoom((value) => Math.max(0.85, value - 0.1))
                  }
                  aria-label="Zoom out"
                >
                  <ZoomOutRoundedIcon fontSize="small" />
                </IconButton>
                <Slider
                  size="small"
                  min={0.85}
                  max={1.5}
                  step={0.05}
                  value={zoom}
                  onChange={(_, value) => setZoom(value as number)}
                  aria-label="Logs zoom"
                />
                <IconButton
                  size="small"
                  onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))}
                  aria-label="Zoom in"
                >
                  <ZoomInRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setZoom(1)}
                  aria-label="Reset zoom"
                >
                  <RestartAltRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Button
                size="small"
                variant="outlined"
                disabled={!pdfPayload || downloading || logs.length === 0}
                onClick={async () => {
                  if (!pdfPayload) return;
                  try {
                    setDownloading(true);
                    await downloadLogsPdf(pdfPayload);
                  } catch (e) {
                    console.error(e);
                    window.alert("Failed to download PDF");
                  } finally {
                    setDownloading(false);
                  }
                }}
              >
                {downloading ? "Preparing…" : "Download PDF"}
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              mx: { xs: 0, sm: -2 },
              px: { xs: 0, sm: 2 },
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.03)
                  : "transparent",
            }}
          >
            <Tabs
              value={safeIdx}
              onChange={(_, v) => setIdx(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                "& .MuiTab-root": {
                  minHeight: 44,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  textTransform: "none",
                  color: "text.secondary",
                },
                "& .Mui-selected": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.primary.main, 0.16)
                      : alpha(theme.palette.primary.main, 0.08),
                  color: "text.primary",
                },
              }}
            >
              {logs.map((l, i) => (
                <Tab key={l.dateISO} label={`Day ${i + 1} • ${l.dateISO}`} />
              ))}
            </Tabs>
          </Box>

          {selectedLog && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {summaryChips.map((chip) => (
                <Chip
                  key={chip.label}
                  size="small"
                  variant="outlined"
                  label={chip.label}
                  sx={{
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.04)
                        : alpha(theme.palette.background.paper, 0.8),
                    borderColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.common.white, 0.1)
                        : alpha(theme.palette.common.black, 0.08),
                  }}
                />
              ))}
            </Stack>
          )}

          {logs.length > 0 ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                background: (t) =>
                  `linear-gradient(180deg, ${alpha(t.palette.background.paper, t.palette.mode === "dark" ? 0.44 : 0.88)} 0%, ${alpha(t.palette.background.default, t.palette.mode === "dark" ? 0.5 : 0.92)} 100%)`,
                bgcolor: (t) =>
                  alpha(
                    t.palette.background.paper,
                    t.palette.mode === "dark" ? 0.3 : 0.55,
                  ),
                p: 2,
                overflow: "auto",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.04)}`
                    : "none",
              }}
            >
              <Box
                sx={{
                  width: "min(100%, 980px)",
                  mx: "auto",
                  bgcolor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgb(247, 243, 236)"
                      : t.palette.common.white,
                  border: "1px solid",
                  borderColor: (t) =>
                    t.palette.mode === "dark"
                      ? alpha(t.palette.common.black, 0.22)
                      : alpha(t.palette.common.black, 0.1),
                  borderRadius: 1,
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? `0 18px 42px ${alpha(theme.palette.common.black, 0.34)}`
                      : theme.shadows[6],
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                }}
              >
                <EldLogSheet log={logs[safeIdx]} />
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "center", mt: 1.5 }}
              >
                Default fit is tuned for the panel. Use the zoom controls only
                when you need a closer read.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No logs generated yet. Plan a trip to create daily log sheets.
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default LogsViewer;
