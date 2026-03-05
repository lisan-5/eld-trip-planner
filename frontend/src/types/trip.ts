export type DutyStatus = "OFF" | "SB" | "D" | "ON";

export type StopType =
  | "START"
  | "PICKUP"
  | "DROPOFF"
  | "FUEL"
  | "BREAK"
  | "SLEEP";

export type TripInputs = {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  cycleUsedHours: number;
  startTimeISO?: string; // optional for later
};

export type RouteInfo = {
  distanceMiles: number;
  durationMinutes: number;
  polyline: Array<[number, number]>; // [lat, lng]
};

export type Stop = {
  id: string;
  type: StopType;
  label: string;
  lat: number;
  lng: number;
  etaISO?: string;
};

export type TimelineEvent = {
  id: string;
  type: StopType;
  status: DutyStatus;
  title: string;
  locationLabel: string;
  startISO: string;
  endISO: string;
  lat?: number;
  lng?: number;
  distanceMilesSoFar?: number;
};

export type LogSegment = {
  status: DutyStatus;
  startMinute: number; // 0..1440
  endMinute: number; // 0..1440
  locationLabel?: string;
  note?: string;
};

export type DailyLog = {
  dateISO: string; // YYYY-MM-DD
  segments: LogSegment[];
  totals: {
    offDutyMins: number;
    sleeperMins: number;
    drivingMins: number;
    onDutyMins: number;
  };
  remarks: Array<{ time: string; location: string; note: string }>;
  milesDriven: number;
};

export type PlanTripResponse = {
  route: RouteInfo;
  stops: Stop[];
  events: TimelineEvent[];
  logs: DailyLog[];
  meta: {
    cycleUsedHours: number;
    cycleRemainingHours: number;
  };
};
