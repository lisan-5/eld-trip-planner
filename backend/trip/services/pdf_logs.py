from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.lib import colors

STATUS_ROW = {"OFF": 0, "SB": 1, "D": 2, "ON": 3}

STATUS_COLOR = {
    "OFF": colors.HexColor("#64748B"),
    "SB": colors.HexColor("#7C3AED"),
    "D": colors.HexColor("#EA580C"),
    "ON": colors.HexColor("#0F766E"),
}


def _fmt_mins(m: int) -> str:
    h = m // 60
    mm = m % 60
    return f"{h}:{mm:02d}"


def _draw_grid(c: canvas.Canvas, x: float, y: float, w: float, h: float):
    c.setFillColor(colors.Color(0.956, 0.968, 0.988, alpha=1))
    c.roundRect(x, y, w, h, 10, stroke=0, fill=1)

    # Outer
    c.setStrokeColor(colors.Color(0.15, 0.18, 0.25, alpha=0.30))
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, 10, stroke=1, fill=0)

    # Vertical hour lines (0..24)
    for i in range(25):
        xx = x + (i / 24.0) * w
        c.setLineWidth(1.2 if i % 6 == 0 else 0.8)
        c.setStrokeColor(colors.Color(0.15, 0.18, 0.25, alpha=0.25))
        c.line(xx, y, xx, y + h)
        if i < 24:
            c.setFillColor(colors.Color(0.15, 0.18, 0.25, alpha=0.70))
            c.setFont("Helvetica", 8)
            c.drawString(xx + 2, y + h + 6, str(i))

    # Quarter-hour light lines
    c.setLineWidth(0.5)
    c.setStrokeColor(colors.Color(0.15, 0.18, 0.25, alpha=0.08))
    for q in range(24 * 4 + 1):
        if q % 4 == 0:
            continue
        xx = x + (q / (24.0 * 4.0)) * w
        c.line(xx, y, xx, y + h)

    # Horizontal 4 rows
    row_h = h / 4.0
    c.setLineWidth(1)
    c.setStrokeColor(colors.Color(0.15, 0.18, 0.25, alpha=0.22))
    for r in range(5):
        yy = y + r * row_h
        c.line(x, yy, x + w, yy)


def _x_from_min(minute: int, x: float, w: float) -> float:
    minute = max(0, min(1440, int(minute)))
    return x + (minute / 1440.0) * w


def _y_for_status(status: str, y: float, h: float) -> float:
    row = STATUS_ROW.get(status, 0)
    row_h = h / 4.0
    # middle-ish of the row
    return y + (3 - row) * row_h + row_h * 0.55  # invert so OFF is top row visually


def _draw_metric_box(c: canvas.Canvas, x: float, y: float, w: float, h: float, label: str, value: str, color):
    c.setFillColor(colors.Color(color.red, color.green, color.blue, alpha=0.10))
    c.setStrokeColor(colors.Color(color.red, color.green, color.blue, alpha=0.30))
    c.roundRect(x, y, w, h, 10, stroke=1, fill=1)

    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 10, y + h - 14, label)

    c.setFillColor(colors.Color(0.10, 0.12, 0.18, alpha=0.88))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x + 10, y + 10, value)


def build_logs_pdf(payload: dict) -> bytes:
    """
    payload from frontend:
      { route, logs, meta, tripLabels? }
    """
    logs = payload.get("logs") or []
    route = payload.get("route") or {}
    meta = payload.get("meta") or {}

    buf = BytesIO()
    page = landscape(letter)
    c = canvas.Canvas(buf, pagesize=page)

    W, H = page

    for i, log in enumerate(logs):
        dateISO = log.get("dateISO", "")
        totals = log.get("totals", {})
        remarks = log.get("remarks", [])
        miles = log.get("milesDriven", 0)

        # Header
        c.setFillColor(colors.Color(0.10, 0.12, 0.18))
        c.setFont("Helvetica-Bold", 16)
        c.drawString(0.7 * inch, H - 0.7 * inch, "Driver’s Daily Log (ELD-style)")

        c.setFont("Helvetica", 10)
        c.setFillColor(colors.Color(0.10, 0.12, 0.18, alpha=0.75))
        c.drawString(0.7 * inch, H - 0.95 * inch, f"Date: {dateISO}  |  24-hour period")

        # Trip summary line
        dist = route.get("distanceMiles", 0)
        dur = route.get("durationMinutes", 0)
        c.drawRightString(W - 0.7 * inch, H - 0.95 * inch, f"{int(dist)} mi • {dur/60.0:.1f} hrs • Miles today: {miles}")

        # Cycle info
        c.setFont("Helvetica", 9)
        c.drawRightString(
            W - 0.7 * inch,
            H - 1.15 * inch,
            f"Cycle Used: {meta.get('cycleUsedHours', 0):.1f}h  |  Remaining: {meta.get('cycleRemainingHours', 0):.1f}h"
        )

        # Header metric cards
        metric_y = H - 1.6 * inch
        metric_w = 1.15 * inch
        metric_h = 0.52 * inch
        metric_xs = [W - 4.45 * inch, W - 3.2 * inch, W - 1.95 * inch]
        header_metrics = [
            ("Miles", str(miles), colors.HexColor("#EA580C")),
            ("On duty", _fmt_mins(int(totals.get("onDutyMins", 0) + totals.get("drivingMins", 0))), colors.HexColor("#0F766E")),
            ("Driving", _fmt_mins(int(totals.get("drivingMins", 0))), colors.HexColor("#2563EB")),
        ]
        for idx, (label, value, color) in enumerate(header_metrics):
            _draw_metric_box(c, metric_xs[idx], metric_y, metric_w, metric_h, label, value, color)

        # Labels left of grid
        labels_x = 0.7 * inch
        grid_x = 2.8 * inch
        grid_y = 2.75 * inch
        grid_w = W - grid_x - 0.8 * inch
        grid_h = 2.2 * inch

        c.setFont("Helvetica", 9)
        c.setFillColor(colors.Color(0.10, 0.12, 0.18, alpha=0.85))
        c.drawString(labels_x, grid_y + grid_h - 0.25 * inch, "1. Off Duty")
        c.drawString(labels_x, grid_y + grid_h - 0.80 * inch, "2. Sleeper Berth")
        c.drawString(labels_x, grid_y + grid_h - 1.35 * inch, "3. Driving")
        c.drawString(labels_x, grid_y + grid_h - 1.90 * inch, "4. On Duty (Not Driving)")

        # Grid
        _draw_grid(c, grid_x, grid_y, grid_w, grid_h)

        # Duty lines
        segs = log.get("segments") or []
        c.setLineWidth(3.5)
        for seg in segs:
            st = seg.get("status")
            x1 = _x_from_min(seg.get("startMinute", 0), grid_x, grid_w)
            x2 = _x_from_min(seg.get("endMinute", 0), grid_x, grid_w)
            yy = _y_for_status(st, grid_y, grid_h)
            c.setStrokeColor(STATUS_COLOR.get(st, colors.Color(0.05, 0.08, 0.14, alpha=0.92)))
            c.line(x1, yy, x2, yy)

        # Totals below grid
        totals_y = grid_y - 0.55 * inch
        totals_w = 1.15 * inch
        totals_h = 0.48 * inch
        totals_gap = 0.12 * inch
        totals_x = grid_x
        total_rows = [
            ("OFF", totals.get("offDutyMins", 0)),
            ("SB", totals.get("sleeperMins", 0)),
            ("DR", totals.get("drivingMins", 0)),
            ("ON", totals.get("onDutyMins", 0)),
        ]
        for idx, (lbl, mins) in enumerate(total_rows):
            color_key = "D" if lbl == "DR" else lbl
            _draw_metric_box(
                c,
                totals_x + idx * (totals_w + totals_gap),
                totals_y,
                totals_w,
                totals_h,
                lbl,
                _fmt_mins(int(mins)),
                STATUS_COLOR[color_key],
            )

        # Remarks
        remarks_y = 0.75 * inch
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(colors.Color(0.10, 0.12, 0.18, alpha=0.85))
        c.drawString(0.7 * inch, remarks_y + 0.9 * inch, "Remarks (location at each status change)")

        c.setStrokeColor(colors.Color(0.15, 0.18, 0.25, alpha=0.25))
        c.setFillColor(colors.Color(0.99, 0.992, 1, alpha=1))
        c.roundRect(0.7 * inch, remarks_y, W - 1.4 * inch, 0.8 * inch, 10, stroke=1, fill=1)

        c.setFont("Helvetica", 9)
        c.setFillColor(colors.Color(0.10, 0.12, 0.18, alpha=0.75))

        # Print up to 7 remark lines
        max_lines = 7
        start_y = remarks_y + 0.62 * inch
        for j, r in enumerate(remarks[:max_lines]):
            c.drawString(
                0.85 * inch,
                start_y - j * 0.12 * inch,
                f"{r.get('time','--:--')}  {r.get('location','Unknown')}  |  {r.get('note','')}"
            )

        c.showPage()

    c.save()
    return buf.getvalue()
