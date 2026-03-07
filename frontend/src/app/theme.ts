import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { orange } from "@mui/material/colors";

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  const primaryMain = isDark ? orange[500] : orange[600];
  const primaryLight = orange[400];
  const primaryDark = orange[700];

  const bgDefault = isDark ? "#09111F" : "#F6F1E8";
  const bgPaper = isDark ? "#111827" : "#FFF9F0";

  const divider = isDark
    ? "rgba(226, 232, 240, 0.10)"
    : "rgba(15, 23, 42, 0.08)";

  const bodyBg = isDark
    ? "radial-gradient(1200px 700px at 12% -8%, rgba(249, 115, 22, 0.28) 0%, rgba(9, 17, 31, 0) 58%), radial-gradient(780px 420px at 0% 45%, rgba(251, 146, 60, 0.10) 0%, rgba(9, 17, 31, 0) 62%), radial-gradient(900px 540px at 88% 2%, rgba(14, 165, 233, 0.15) 0%, rgba(9, 17, 31, 0) 55%), linear-gradient(180deg, #08101B 0%, #0D1729 100%)"
    : "radial-gradient(1200px 700px at 12% -8%, rgba(249, 115, 22, 0.18) 0%, rgba(246, 241, 232, 0) 58%), radial-gradient(780px 420px at 0% 45%, rgba(251, 146, 60, 0.07) 0%, rgba(246, 241, 232, 0) 62%), radial-gradient(900px 540px at 88% 2%, rgba(14, 165, 233, 0.09) 0%, rgba(246, 241, 232, 0) 55%), linear-gradient(180deg, #FCF6ED 0%, #F2F4F8 100%)";

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
        '"Plus Jakarta Sans", "Segoe UI Variable Display", "Aptos", ui-sans-serif, system-ui, sans-serif',
      h4: { fontWeight: 760, letterSpacing: "-0.025em" },
      h5: { fontWeight: 740, letterSpacing: "-0.022em" },
      h6: { fontWeight: 710, letterSpacing: "-0.015em" },
      subtitle1: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 650 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "@keyframes brandFloat": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-4px)" },
          },
          "@keyframes brandSheen": {
            "0%": { transform: "translateX(-140%) rotate(18deg)" },
            "100%": { transform: "translateX(180%) rotate(18deg)" },
          },
          "@keyframes ctaGlow": {
            "0%, 100%": { boxShadow: `0 10px 24px rgba(0,0,0,0)` },
            "50%": { boxShadow: `0 18px 38px ${orange[500]}55` },
          },
          body: {
            background: bodyBg,
            backgroundAttachment: "fixed",
          },
          "body::after": {
            content: '""',
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            background: isDark
              ? "linear-gradient(90deg, rgba(249,115,22,0.05) 0%, rgba(249,115,22,0.015) 24%, rgba(255,255,255,0) 45%)"
              : "linear-gradient(90deg, rgba(249,115,22,0.06) 0%, rgba(249,115,22,0.02) 24%, rgba(255,255,255,0) 45%)",
            opacity: 0.9,
          },
          "#root": {
            position: "relative",
          },
          ".brand-badge": {
            position: "relative",
            overflow: "hidden",
            animation: "brandFloat 4.2s ease-in-out infinite",
          },
          ".brand-badge::after": {
            content: '""',
            position: "absolute",
            inset: "-35%",
            background:
              "linear-gradient(115deg, rgba(255,255,255,0) 22%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0) 74%)",
            animation: "brandSheen 3.8s linear infinite",
          },
          ".brand-logo-icon": {
            fontSize: 26,
          },
          ".cta-pulse": {
            animation: "ctaGlow 2.8s ease-in-out infinite",
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
            backgroundImage: isDark
              ? `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%), linear-gradient(135deg, ${alpha(primaryMain, 0.06)} 0%, transparent 34%)`
              : `linear-gradient(180deg, rgba(255,255,255,0.74) 0%, rgba(255,255,255,0.48) 100%), linear-gradient(135deg, ${alpha(primaryMain, 0.06)} 0%, transparent 34%)`,
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
            backgroundImage: isDark
              ? `linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%), linear-gradient(135deg, ${alpha(primaryMain, 0.055)} 0%, transparent 34%)`
              : `linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.58) 100%), linear-gradient(135deg, ${alpha(primaryMain, 0.05)} 0%, transparent 34%)`,
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
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 14,
              backgroundColor: isDark
                ? alpha("#0B1220", 0.68)
                : alpha("#FFFFFF", 0.82),
              backdropFilter: "blur(10px)",
            },
          },
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
            boxShadow: `0 12px 28px ${alpha(primaryMain, isDark ? 0.24 : 0.18)}`,
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
            backdropFilter: "blur(8px)",
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
