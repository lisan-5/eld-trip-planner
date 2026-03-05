import { create } from "zustand";
import type { TripInputs } from "../../types/trip";

type TripState = {
  inputs: TripInputs;
  setInputs: (patch: Partial<TripInputs>) => void;
  loadSampleTrip: () => void;
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
  loadSampleTrip: () =>
    set(() => ({
      inputs: {
        currentLocation: "Chicago, IL",
        pickupLocation: "Milwaukee, WI",
        dropoffLocation: "Indianapolis, IN",
        cycleUsedHours: 12,
        startTimeISO: undefined,
      },
    })),
}));
