import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { orange } from "@mui/material/colors";

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  const primaryMain = isDark ? orange[500] : orange[600];
  const primaryLight = orange[400];
  const primaryDark = orange[700];

  const bgDefault = isDark ? "#0B1020" : "#F7F8FC";
  const bgPaper = isDark ? "#0F172A" : "#FFFFFF";

  const divider = isDark
    ? "rgba(226, 232, 240, 0.10)"
    : "rgba(15, 23, 42, 0.08)";

  const bodyBg = isDark
    ? "radial-gradient(1100px 600px at 18% -10%, rgba(249, 115, 22, 0.22) 0%, rgba(11, 16, 32, 0) 60%), radial-gradient(900px 520px at 90% 0%, rgba(0, 163, 137, 0.14) 0%, rgba(11, 16, 32, 0) 55%), #0B1020"
    : "radial-gradient(1100px 600px at 18% -10%, rgba(249, 115, 22, 0.10) 0%, rgba(247, 248, 252, 0) 60%), radial-gradient(900px 520px at 90% 0%, rgba(0, 163, 137, 0.08) 0%, rgba(247, 248, 252, 0) 55%), #F7F8FC";

  return createTheme({
    palette: {
      mode,
      background: {
        default: bgDefault,
        paper: bgPaper,
      },
      primary: {
        // dispatch / route oriented
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
        contrastText: "#fff",
      },
      secondary: {
        // accent for success/confirmation states
        main: "#00A389",
      },
      text: {
        primary: isDark ? "#E5E7EB" : "#0F172A",
        secondary: isDark
          ? "rgba(226, 232, 240, 0.70)"
          : "rgba(15, 23, 42, 0.68)",
      },
      divider,
    },
    shape: {
      borderRadius: 16,
    },
    spacing: 8,
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
      h4: { fontWeight: 760, letterSpacing: "-0.025em" },
      h5: { fontWeight: 740, letterSpacing: "-0.022em" },
      h6: { fontWeight: 710, letterSpacing: "-0.015em" },
      subtitle1: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 650 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: bodyBg,
            backgroundAttachment: "fixed",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
            boxShadow: isDark
              ? "0 12px 30px rgba(0, 0, 0, 0.45)"
              : "0 10px 30px rgba(15, 23, 42, 0.06)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
            boxShadow: isDark
              ? "0 12px 30px rgba(0, 0, 0, 0.45)"
              : "0 10px 30px rgba(15, 23, 42, 0.06)",
            transition:
              "box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease",
            "&:hover": {
              borderColor: isDark
                ? "rgba(226, 232, 240, 0.16)"
                : "rgba(15, 23, 42, 0.12)",
              boxShadow: isDark
                ? "0 16px 38px rgba(0, 0, 0, 0.55)"
                : "0 14px 40px rgba(15, 23, 42, 0.08)",
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },
      MuiButton: {
        defaultProps: {
          variant: "contained",
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition:
              "transform 120ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease",
            willChange: "transform",
            "&:hover": {
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0) scale(0.98)",
            },
            "&.Mui-disabled": {
              transform: "none",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "transform 120ms ease, background-color 160ms ease",
            "&:hover": {
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0) scale(0.96)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 650,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 40,
            textTransform: "none",
            fontWeight: 650,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 999,
          },
        },
      },
    },
  });
}
