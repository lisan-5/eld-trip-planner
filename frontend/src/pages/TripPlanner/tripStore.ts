import { create } from "zustand";
import type { TripInputs } from "../../types/trip";

type TripState = {
  inputs: TripInputs;
  setInputs: (patch: Partial<TripInputs>) => void;
};

export const useTripStore = create<TripState>((set) => ({
  inputs: {
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    cycleUsedHours: 0,
    startTimeISO: undefined,
  },
  setInputs: (patch) =>
    set((s) => ({
      inputs: { ...s.inputs, ...patch },
    })),
}));
