import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PaletteMode } from "@mui/material";

const STORAGE_KEY = "spotter-color-mode";

export type ColorModeContextValue = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggle: () => void;
};

export const ColorModeContext = createContext<ColorModeContextValue | null>(
  null,
);

export function useStoredColorMode(): [
  PaletteMode,
  (mode: PaletteMode) => void,
] {
  const [mode, setModeState] = useState<PaletteMode>(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "dark" || raw === "light" ? raw : "light";
  });

  const setMode = useCallback((next: PaletteMode) => {
    setModeState(next);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return [mode, setMode];
}

export function createColorModeValue(
  mode: PaletteMode,
  setMode: (mode: PaletteMode) => void,
): ColorModeContextValue {
  return {
    mode,
    setMode,
    toggle: () => setMode(mode === "dark" ? "light" : "dark"),
  };
}

export function useColorModeValue(): ColorModeContextValue {
  const [mode, setMode] = useStoredColorMode();

  return useMemo(() => createColorModeValue(mode, setMode), [mode, setMode]);
}
