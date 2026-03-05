import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./app/theme";
import { ColorModeContext, useColorModeValue } from "./app/colorMode";
import { AppRouter } from "./app/router";
import "./styles/global.css";

type ErrorBoundaryState = {
  errorMessage: string | null;
};

function safeGetStoredMode(): "light" | "dark" {
  try {
    const stored = window.localStorage.getItem("spotter-color-mode");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // ignore
  }
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { errorMessage: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error ? error.stack || error.message : String(error);
    return { errorMessage: message };
  }

  render() {
    if (this.state.errorMessage) {
      let ui = {
        padding: 16,
        fontFamily: "system-ui",
        color: "#111",
        background: "#fff",
      } as React.CSSProperties;

      try {
        const theme = createAppTheme(safeGetStoredMode());
        ui = {
          padding: theme.spacing(2) as any,
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary,
          background: theme.palette.background.default,
        };
      } catch {
        // ignore
      }

      return (
        <div style={ui}>
          <h2>Runtime error</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.errorMessage}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

window.addEventListener("error", (event) => {
  console.error("Global runtime error:", event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

function RootApp() {
  const colorMode = useColorModeValue();
  const theme = React.useMemo(
    () => createAppTheme(colorMode.mode),
    [colorMode.mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <RootApp />
    </AppErrorBoundary>
  </React.StrictMode>,
);
