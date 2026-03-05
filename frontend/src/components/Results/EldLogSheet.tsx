import { Box, Divider, Stack, Typography } from "@mui/material";
import type { DailyLog, DutyStatus, LogSegment } from "../../types/trip";

const ROWS: Array<{ status: DutyStatus; label: string }> = [
  { status: "OFF", label: "1. Off Duty" },
  { status: "SB", label: "2. Sleeper Berth" },
  { status: "D", label: "3. Driving" },
  { status: "ON", label: "4. On Duty (Not Driving)" },
];

function minsToX(min: number, width: number) {
  return (min / 1440) * width;
}

function rowToY(rowIndex: number, top: number, rowH: number) {
  return top + rowIndex * rowH;
}

function statusRowIndex(status: DutyStatus) {
  return ROWS.findIndex((r) => r.status === status);
}

function fmtMins(m: number) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, "0")}`;
}

function buildPaths(
  segments: LogSegment[],
  width: number,
  top: number,
  rowH: number,
) {
  return segments.map((seg, i) => {
    const y = rowToY(statusRowIndex(seg.status), top, rowH) + rowH * 0.55;
    const x1 = minsToX(seg.startMinute, width);
    const x2 = minsToX(seg.endMinute, width);
    return (
      <line
        key={`${seg.status}-${i}-${seg.startMinute}`}
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke="rgba(10, 20, 40, 0.92)"
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  });
}

export function EldLogSheet({ log }: { log: DailyLog }) {
  const W = 980;
  const H = 360;
  const gridTop = 74;
  const gridH = 200;
  const rowH = gridH / 4;

  const hourLines = Array.from({ length: 25 }).map((_, i) => i);
  const quarterLines = Array.from({ length: 24 * 4 + 1 }).map((_, i) => i);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          bgcolor: "rgba(255,255,255,0.8)",
          borderRadius: 1,
          border: "1px solid rgba(20, 20, 40, 0.08)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle1">
                Driver’s Daily Log (ELD-style)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {log.dateISO} • 24-hour period
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                From: <strong>{log.remarks?.[0]?.location ?? "—"}</strong>
                &nbsp;→&nbsp; To:{" "}
                <strong>
                  {log.remarks?.[log.remarks.length - 1]?.location ?? "—"}
                </strong>
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Typography variant="body2" color="text.secondary">
                Miles: <strong>{log.milesDriven}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On duty:{" "}
                <strong>
                  {fmtMins(log.totals.onDutyMins + log.totals.drivingMins)}
                </strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Driving: <strong>{fmtMins(log.totals.drivingMins)}</strong>
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="ELD log grid"
          >
            {/* Title row labels */}
            {ROWS.map((r, idx) => (
              <text
                key={r.status}
                x={10}
                y={gridTop + idx * rowH + rowH * 0.6}
                fontSize="12"
                fill="rgba(20, 20, 40, 0.85)"
              >
                {r.label}
              </text>
            ))}

            {/* Grid background */}
            <rect
              x={170}
              y={gridTop}
              width={W - 190}
              height={gridH}
              rx={10}
              fill="rgba(246, 247, 251, 0.9)"
              stroke="rgba(20, 20, 40, 0.12)"
            />

            {/* Hour labels */}
            {hourLines.map((h) => {
              const x = 170 + (h / 24) * (W - 190);
              return (
                <g key={`hour-${h}`}>
                  <line
                    x1={x}
                    y1={gridTop}
                    x2={x}
                    y2={gridTop + gridH}
                    stroke="rgba(20, 20, 40, 0.16)"
                    strokeWidth={h % 6 === 0 ? 1.5 : 1}
                  />
                  {h < 24 && (
                    <text
                      x={x + 2}
                      y={gridTop - 8}
                      fontSize="10"
                      fill="rgba(20, 20, 40, 0.65)"
                    >
                      {h}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Quarter-hour thin lines */}
            {quarterLines.map((q) => {
              const x = 170 + (q / (24 * 4)) * (W - 190);
              const isHour = q % 4 === 0;
              if (isHour) return null;
              return (
                <line
                  key={`q-${q}`}
                  x1={x}
                  y1={gridTop}
                  x2={x}
                  y2={gridTop + gridH}
                  stroke="rgba(20, 20, 40, 0.06)"
                  strokeWidth={1}
                />
              );
            })}

            {/* Row separators */}
            {Array.from({ length: 5 }).map((_, i) => (
              <line
                key={`row-${i}`}
                x1={170}
                y1={gridTop + i * rowH}
                x2={W - 20}
                y2={gridTop + i * rowH}
                stroke="rgba(20, 20, 40, 0.12)"
              />
            ))}

            {/* Duty segments */}
            <g transform={`translate(170, 0)`}>
              {buildPaths(log.segments, W - 190, gridTop, rowH)}
            </g>

            {/* Totals box */}
            <rect
              x={W - 170}
              y={gridTop}
              width={150}
              height={gridH}
              rx={10}
              fill="rgba(255,255,255,0.9)"
              stroke="rgba(20, 20, 40, 0.12)"
            />
            <text
              x={W - 160}
              y={gridTop - 8}
              fontSize="10"
              fill="rgba(20, 20, 40, 0.65)"
            >
              Total Hours
            </text>

            {[
              { label: "OFF", v: log.totals.offDutyMins },
              { label: "SB", v: log.totals.sleeperMins },
              { label: "D", v: log.totals.drivingMins },
              { label: "ON", v: log.totals.onDutyMins },
            ].map((t, i) => (
              <g key={t.label}>
                <text
                  x={W - 160}
                  y={gridTop + i * rowH + rowH * 0.6}
                  fontSize="11"
                  fill="rgba(20, 20, 40, 0.8)"
                >
                  {t.label}: {fmtMins(t.v)}
                </text>
              </g>
            ))}

            {/* Remarks header */}
            <text
              x={10}
              y={gridTop + gridH + 42}
              fontSize="12"
              fill="rgba(20, 20, 40, 0.85)"
            >
              Remarks (location at each status change)
            </text>
            <rect
              x={10}
              y={gridTop + gridH + 52}
              width={W - 30}
              height={70}
              rx={10}
              fill="rgba(255,255,255,0.9)"
              stroke="rgba(20, 20, 40, 0.12)"
            />

            {log.remarks.slice(0, 6).map((r, i) => (
              <text
                key={`${r.time}-${i}`}
                x={20}
                y={gridTop + gridH + 78 + i * 18}
                fontSize="11"
                fill="rgba(20, 20, 40, 0.75)"
              >
                {r.time} {r.location} | {r.note}
              </text>
            ))}
          </svg>
        </Box>
      </Box>
    </Stack>
  );
}
