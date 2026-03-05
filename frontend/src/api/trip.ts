import type { PlanTripResponse, TripInputs } from "../types/trip";
import { postJSON } from "./client";

export async function planTrip(inputs: TripInputs): Promise<PlanTripResponse> {
  return await postJSON<PlanTripResponse>("/api/plan-trip/", inputs);
}
