import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
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

function fmtDuration(m: number) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm.toString().padStart(2, "0")}m`;
}

function statusColor(status: DutyStatus) {
  switch (status) {
    case "OFF":
      return "#64748B";
    case "SB":
      return "#7C3AED";
    case "D":
      return "#EA580C";
    case "ON":
      return "#0F766E";
    default:
      return "rgba(10, 20, 40, 0.92)";
  }
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
        stroke={statusColor(seg.status)}
        strokeWidth={4.5}
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
  const headerFields = [
    { label: "Truck #", value: "—" },
    { label: "Trailer #", value: "—" },
    { label: "Carrier", value: "—" },
    { label: "Home terminal", value: "—" },
    { label: "Load ref", value: "—" },
  ];
  const recapItems = [
    {
      label: "Off Duty",
      value: fmtDuration(log.totals.offDutyMins),
      color: statusColor("OFF"),
    },
    {
      label: "Sleeper",
      value: fmtDuration(log.totals.sleeperMins),
      color: statusColor("SB"),
    },
    {
      label: "Driving",
      value: fmtDuration(log.totals.drivingMins),
      color: statusColor("D"),
    },
    {
      label: "On Duty",
      value: fmtDuration(log.totals.onDutyMins),
      color: statusColor("ON"),
    },
  ];
  const totals = [
    {
      label: "OFF",
      value: fmtMins(log.totals.offDutyMins),
      color: statusColor("OFF"),
    },
    {
      label: "SB",
      value: fmtMins(log.totals.sleeperMins),
      color: statusColor("SB"),
    },
    {
      label: "DR",
      value: fmtMins(log.totals.drivingMins),
      color: statusColor("D"),
    },
    {
      label: "ON",
      value: fmtMins(log.totals.onDutyMins),
      color: statusColor("ON"),
    },
  ];

  const hourLines = Array.from({ length: 25 }).map((_, i) => i);
  const quarterLines = Array.from({ length: 24 * 4 + 1 }).map((_, i) => i);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {recapItems.map((item) => (
          <Chip
            key={item.label}
            size="small"
            label={`${item.label}: ${item.value}`}
            sx={{
              borderRadius: 1.5,
              height: 26,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.01em",
              color: item.color,
              border: `1px solid ${item.color}33`,
              backgroundColor: `${item.color}12`,
            }}
          />
        ))}
      </Stack>

      <Box
        sx={{
          background:
            "linear-gradient(180deg, rgba(251,249,244,0.985) 0%, rgba(247,244,238,0.985) 100%)",
          borderRadius: 2,
          border: "1px solid rgba(74, 63, 48, 0.18)",
          overflow: "hidden",
          boxShadow: "0 10px 24px rgba(35, 27, 16, 0.08)",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  color: "rgba(78, 59, 35, 0.72)",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  lineHeight: 1.2,
                }}
              >
                24-HOUR RECORD OF DUTY STATUS
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: "0.01em",
                  color: "rgba(38, 28, 18, 0.92)",
                }}
              >
                Driver’s Daily Log
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(78, 59, 35, 0.72)", fontSize: 11.5 }}
              >
                Date: {log.dateISO} • 24-hour period
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  display: "block",
                  color: "rgba(62, 46, 28, 0.76)",
                  fontSize: 11.5,
                }}
              >
                From: <strong>{log.remarks?.[0]?.location ?? "—"}</strong>
                &nbsp;→&nbsp; To:{" "}
                <strong>
                  {log.remarks?.[log.remarks.length - 1]?.location ?? "—"}
                </strong>
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              flexWrap="wrap"
              useFlexGap
            >
              {[
                { label: "Miles", value: `${log.milesDriven}` },
                {
                  label: "On duty",
                  value: fmtMins(
                    log.totals.onDutyMins + log.totals.drivingMins,
                  ),
                },
                { label: "Driving", value: fmtMins(log.totals.drivingMins) },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    minWidth: 110,
                    px: 1.1,
                    py: 0.75,
                    borderRadius: 1.25,
                    border: "1px solid rgba(78, 59, 35, 0.14)",
                    bgcolor: "rgba(255,250,244,0.84)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(78, 59, 35, 0.72)", fontSize: 10.5 }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 760, color: "rgba(38, 28, 18, 0.92)" }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 1.5 }}
          >
            {headerFields.map((field) => (
              <Box
                key={field.label}
                sx={{
                  minWidth: { xs: "calc(50% - 4px)", md: 132 },
                  flex: field.label === "Load ref" ? { md: 1.2 } : 1,
                  px: 1,
                  py: 0.7,
                  borderRadius: 1,
                  border: "1px solid rgba(78, 59, 35, 0.12)",
                  bgcolor: "rgba(255,252,247,0.78)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontSize: 10,
                    color: "rgba(78, 59, 35, 0.68)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {field.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    minHeight: 20,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "rgba(38, 28, 18, 0.86)",
                  }}
                >
                  {field.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "rgba(78, 59, 35, 0.12)" }} />

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
              width={W - 210}
              height={gridH}
              rx={10}
              fill="rgba(255, 252, 246, 0.98)"
              stroke="rgba(78, 59, 35, 0.18)"
            />

            {/* Hour labels */}
            {hourLines.map((h) => {
              const x = 170 + (h / 24) * (W - 210);
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
                      fill="rgba(78, 59, 35, 0.72)"
                    >
                      {h}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Quarter-hour thin lines */}
            {quarterLines.map((q) => {
              const x = 170 + (q / (24 * 4)) * (W - 210);
              const isHour = q % 4 === 0;
              if (isHour) return null;
              return (
                <line
                  key={`q-${q}`}
                  x1={x}
                  y1={gridTop}
                  y2={gridTop + gridH}
                  stroke="rgba(78, 59, 35, 0.055)"
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
                stroke="rgba(78, 59, 35, 0.14)"
              />
            ))}

            {/* Duty segments */}
            <g transform={`translate(170, 0)`}>
              {buildPaths(log.segments, W - 210, gridTop, rowH)}
            </g>

            {/* Remarks header */}
            <text
              x={10}
              y={gridTop + gridH + 42}
              fontSize="12"
              fill="rgba(62, 46, 28, 0.82)"
            >
              Remarks (location at each status change)
            </text>
            <rect
              x={10}
              y={gridTop + gridH + 52}
              width={W - 30}
              height={70}
              rx={10}
              fill="rgba(255,252,247,0.98)"
              stroke="rgba(78, 59, 35, 0.15)"
            />

            {log.remarks.slice(0, 6).map((r, i) => (
              <text
                key={`${r.time}-${i}`}
                x={20}
                y={gridTop + gridH + 78 + i * 18}
                fontSize="11"
                fill="rgba(62, 46, 28, 0.76)"
              >
                {r.time} {r.location} | {r.note}
              </text>
            ))}
          </svg>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 1.5 }}
          >
            {totals.map((item) => (
              <Box
                key={item.label}
                sx={{
                  minWidth: 110,
                  px: 1.25,
                  py: 0.9,
                  borderRadius: 1.5,
                  border: `1px solid ${item.color}33`,
                  bgcolor: `${item.color}12`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: item.color, fontWeight: 700, fontSize: 10.5 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 760, color: "rgba(38,28,18,0.88)" }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
