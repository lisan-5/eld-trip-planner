import type { PlanTripResponse, TripInputs } from "../types/trip";
import { postJSON } from "./client";

type TripCacheEntry = {
  data: PlanTripResponse;
  savedAt: number;
};

const tripResponseCache = new Map<string, TripCacheEntry>();
const inFlightTripRequests = new Map<string, Promise<PlanTripResponse>>();

function normalizeLocation(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildTripKey(inputs: TripInputs) {
  return JSON.stringify({
    current: normalizeLocation(inputs.currentLocation),
    pickup: normalizeLocation(inputs.pickupLocation),
    dropoff: normalizeLocation(inputs.dropoffLocation),
    cycleUsedHours: Number(inputs.cycleUsedHours ?? 0),
    startTimeISO: inputs.startTimeISO ?? "",
  });
}

export async function planTrip(inputs: TripInputs): Promise<PlanTripResponse> {
  return await postJSON<PlanTripResponse>("/api/plan-trip/", inputs);
}

export function getCachedTripPlan(inputs: TripInputs): PlanTripResponse | null {
  const key = buildTripKey(inputs);
  return tripResponseCache.get(key)?.data ?? null;
}

export async function planTripWithCache(
  inputs: TripInputs,
): Promise<PlanTripResponse> {
  const key = buildTripKey(inputs);

  const active = inFlightTripRequests.get(key);
  if (active) return await active;

  const request = planTrip(inputs)
    .then((result) => {
      tripResponseCache.set(key, { data: result, savedAt: Date.now() });
      return result;
    })
    .finally(() => {
      inFlightTripRequests.delete(key);
    });

  inFlightTripRequests.set(key, request);
  return await request;
}
