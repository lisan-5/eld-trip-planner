import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
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
  const [zoom, setZoom] = useState<1 | 1.25 | 1.5>(1);

  const safeIdx = useMemo(() => {
    if (!logs.length) return 0;
    return Math.max(0, Math.min(idx, logs.length - 1));
  }, [idx, logs.length]);

  return (
    <Card>
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
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
            >
              <ButtonGroup size="small" variant="outlined" aria-label="Zoom">
                <Button
                  onClick={() => setZoom(1)}
                  variant={zoom === 1 ? "contained" : "outlined"}
                >
                  100%
                </Button>
                <Button
                  onClick={() => setZoom(1.25)}
                  variant={zoom === 1.25 ? "contained" : "outlined"}
                >
                  125%
                </Button>
                <Button
                  onClick={() => setZoom(1.5)}
                  variant={zoom === 1.5 ? "contained" : "outlined"}
                >
                  150%
                </Button>
              </ButtonGroup>

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
              mx: -2,
              px: 2,
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
                },
              }}
            >
              {logs.map((l, i) => (
                <Tab key={l.dateISO} label={`Day ${i + 1} • ${l.dateISO}`} />
              ))}
            </Tabs>
          </Box>

          {logs.length > 0 ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: (t) =>
                  alpha(
                    t.palette.background.paper,
                    t.palette.mode === "dark" ? 0.3 : 0.55,
                  ),
                p: 2,
                overflow: "auto",
              }}
            >
              <Box
                sx={{
                  width: "fit-content",
                  mx: "auto",
                  bgcolor: (t) => t.palette.common.white,
                  border: "1px solid",
                  borderColor: (t) => alpha(t.palette.common.black, 0.1),
                  borderRadius: 1,
                  boxShadow: 6,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top center",
                }}
              >
                <EldLogSheet log={logs[safeIdx]} />
              </Box>
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
