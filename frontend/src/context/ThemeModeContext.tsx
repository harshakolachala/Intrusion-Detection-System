import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import type { PaletteMode } from "@mui/material";

interface ThemeModeContextValue {
  mode: PaletteMode;
  isDarkMode: boolean;
  toggleMode: () => void;
  toggleThemeMode: () => void;
}

const ThemeModeContext = createContext<
  ThemeModeContextValue | undefined
>(undefined);

const STORAGE_KEY = "sentinelai_theme_mode";

function getInitialMode(): PaletteMode {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === "light" || saved === "dark") {
    return saved;
  }

  // Default application theme
  return "light";
}

export function ThemeModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setMode] =
    useState<PaletteMode>(getInitialMode);

  /*
   * Persist theme selection.
   *
   * The original storage key and behavior are intentionally
   * preserved so existing user preferences continue to work.
   */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  /*
   * Global HTML theme synchronization.
   *
   * The redesigned frontend uses Tailwind's `dark:` variants.
   * Adding the `dark` class to <html> allows those styles to
   * respond to this same ThemeModeContext.
   */
  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", mode === "dark");

    root.setAttribute(
      "data-theme",
      mode
    );

    root.style.colorScheme = mode;
  }, [mode]);

  /*
   * Global CSS design tokens.
   *
   * These variables are consumed by the redesigned pages,
   * including Login, Register, dashboard pages, navigation,
   * cards, forms, tables and modal surfaces.
   */
  useEffect(() => {
    const root = document.documentElement;

    if (mode === "dark") {
      root.style.setProperty(
        "--page-bg",
        "#080c14"
      );

      root.style.setProperty(
        "--surface",
        "rgba(15, 23, 42, 0.82)"
      );

      root.style.setProperty(
        "--surface-muted",
        "rgba(15, 23, 42, 0.58)"
      );

      root.style.setProperty(
        "--surface-elevated",
        "rgba(30, 41, 59, 0.88)"
      );

      root.style.setProperty(
        "--border",
        "rgba(148, 163, 184, 0.14)"
      );

      root.style.setProperty(
        "--border-strong",
        "rgba(148, 163, 184, 0.24)"
      );

      root.style.setProperty(
        "--text-primary",
        "#f8fafc"
      );

      root.style.setProperty(
        "--text-secondary",
        "#cbd5e1"
      );

      root.style.setProperty(
        "--text-muted",
        "#94a3b8"
      );

      root.style.setProperty(
        "--text-subtle",
        "#64748b"
      );

      root.style.setProperty(
        "--shadow-sm",
        "0 4px 18px rgba(0, 0, 0, 0.18)"
      );

      root.style.setProperty(
        "--shadow-md",
        "0 12px 36px rgba(0, 0, 0, 0.24)"
      );

      root.style.setProperty(
        "--shadow-lg",
        "0 24px 70px rgba(0, 0, 0, 0.32)"
      );

      root.style.setProperty(
        "--glass-bg",
        "rgba(15, 23, 42, 0.68)"
      );

      root.style.setProperty(
        "--glass-border",
        "rgba(148, 163, 184, 0.16)"
      );
    } else {
      root.style.setProperty(
        "--page-bg",
        "#f8fafc"
      );

      root.style.setProperty(
        "--surface",
        "rgba(255, 255, 255, 0.88)"
      );

      root.style.setProperty(
        "--surface-muted",
        "rgba(248, 250, 252, 0.92)"
      );

      root.style.setProperty(
        "--surface-elevated",
        "#ffffff"
      );

      root.style.setProperty(
        "--border",
        "rgba(100, 116, 139, 0.16)"
      );

      root.style.setProperty(
        "--border-strong",
        "rgba(100, 116, 139, 0.28)"
      );

      root.style.setProperty(
        "--text-primary",
        "#0f172a"
      );

      root.style.setProperty(
        "--text-secondary",
        "#334155"
      );

      root.style.setProperty(
        "--text-muted",
        "#64748b"
      );

      root.style.setProperty(
        "--text-subtle",
        "#94a3b8"
      );

      root.style.setProperty(
        "--shadow-sm",
        "0 4px 18px rgba(15, 23, 42, 0.06)"
      );

      root.style.setProperty(
        "--shadow-md",
        "0 12px 36px rgba(15, 23, 42, 0.08)"
      );

      root.style.setProperty(
        "--shadow-lg",
        "0 24px 70px rgba(15, 23, 42, 0.12)"
      );

      root.style.setProperty(
        "--glass-bg",
        "rgba(255, 255, 255, 0.72)"
      );

      root.style.setProperty(
        "--glass-border",
        "rgba(148, 163, 184, 0.18)"
      );
    }
  }, [mode]);

  /*
   * Theme toggle.
   *
   * Existing consumers can continue calling either
   * toggleMode() or toggleThemeMode().
   */
  const toggleMode = () => {
    setMode((prev) =>
      prev === "light" ? "dark" : "light"
    );
  };

  /*
   * MUI theme remains available for existing MUI-based
   * components elsewhere in the application.
   */
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,

          primary: {
            main:
              mode === "dark"
                ? "#60a5fa"
                : "#2563eb",
          },

          secondary: {
            main:
              mode === "dark"
                ? "#22d3ee"
                : "#0891b2",
          },

          success: {
            main:
              mode === "dark"
                ? "#34d399"
                : "#059669",
          },

          warning: {
            main:
              mode === "dark"
                ? "#fbbf24"
                : "#d97706",
          },

          error: {
            main:
              mode === "dark"
                ? "#fb7185"
                : "#e11d48",
          },

          info: {
            main:
              mode === "dark"
                ? "#38bdf8"
                : "#0284c7",
          },

          background:
            mode === "dark"
              ? {
                  default: "#080c14",
                  paper: "#0f172a",
                }
              : {
                  default: "#f8fafc",
                  paper: "#ffffff",
                },

          text:
            mode === "dark"
              ? {
                  primary: "#f8fafc",
                  secondary: "#94a3b8",
                }
              : {
                  primary: "#0f172a",
                  secondary: "#64748b",
                },

          divider:
            mode === "dark"
              ? "rgba(148, 163, 184, 0.14)"
              : "rgba(100, 116, 139, 0.16)",
        },

        shape: {
          borderRadius: 14,
        },

        typography: {
          fontFamily:
            "'Inter', 'Segoe UI', Roboto, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

          h1: {
            fontWeight: 800,
            letterSpacing: "-0.04em",
          },

          h2: {
            fontWeight: 800,
            letterSpacing: "-0.035em",
          },

          h3: {
            fontWeight: 700,
            letterSpacing: "-0.025em",
          },

          h4: {
            fontWeight: 700,
            letterSpacing: "-0.02em",
          },

          h5: {
            fontWeight: 700,
          },

          h6: {
            fontWeight: 700,
          },

          button: {
            textTransform: "none",
            fontWeight: 700,
          },
        },

        components: {
          MuiCssBaseline: {
            styleOverrides: {
              html: {
                minHeight: "100%",
                backgroundColor:
                  mode === "dark"
                    ? "#080c14"
                    : "#f8fafc",
                transition:
                  "background-color 180ms ease, color 180ms ease",
              },

              body: {
                minHeight: "100%",
                margin: 0,
                backgroundColor:
                  mode === "dark"
                    ? "#080c14"
                    : "#f8fafc",
                color:
                  mode === "dark"
                    ? "#f8fafc"
                    : "#0f172a",
                transition:
                  "background-color 180ms ease, color 180ms ease",
              },

              "*": {
                boxSizing: "border-box",
              },

              "*::selection": {
                backgroundColor:
                  mode === "dark"
                    ? "rgba(96, 165, 250, 0.28)"
                    : "rgba(37, 99, 235, 0.16)",
              },

              "button, input, textarea, select": {
                font: "inherit",
              },

              "button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible":
                {
                  outline: "none",
                  boxShadow:
                    mode === "dark"
                      ? "0 0 0 3px rgba(96, 165, 250, 0.18)"
                      : "0 0 0 3px rgba(37, 99, 235, 0.14)",
                },

              "::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },

              "::-webkit-scrollbar-track": {
                background:
                  mode === "dark"
                    ? "#0b1120"
                    : "#f1f5f9",
              },

              "::-webkit-scrollbar-thumb": {
                background:
                  mode === "dark"
                    ? "#334155"
                    : "#cbd5e1",
                borderRadius: "999px",
              },

              "::-webkit-scrollbar-thumb:hover": {
                background:
                  mode === "dark"
                    ? "#475569"
                    : "#94a3b8",
              },
            },
          },

          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },

          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                minHeight: 42,
              },
            },
          },

          MuiTextField: {
            defaultProps: {
              variant: "outlined",
            },
          },

          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,

                transition:
                  "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",

                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor:
                    mode === "dark"
                      ? "rgba(148, 163, 184, 0.32)"
                      : "rgba(100, 116, 139, 0.32)",
                },

                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 1,
                  borderColor:
                    mode === "dark"
                      ? "#60a5fa"
                      : "#2563eb",
                },
              },

              notchedOutline: {
                borderColor:
                  mode === "dark"
                    ? "rgba(148, 163, 184, 0.18)"
                    : "rgba(100, 116, 139, 0.20)",
              },
            },
          },

          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 18,
                backgroundImage: "none",
                border:
                  mode === "dark"
                    ? "1px solid rgba(148, 163, 184, 0.14)"
                    : "1px solid rgba(100, 116, 139, 0.14)",
                boxShadow:
                  mode === "dark"
                    ? "0 16px 45px rgba(0, 0, 0, 0.22)"
                    : "0 16px 45px rgba(15, 23, 42, 0.07)",
              },
            },
          },

          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 12,
              },
            },
          },

          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 20,
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider
      value={{
        mode,
        isDarkMode: mode === "dark",
        toggleMode,
        toggleThemeMode: toggleMode,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error(
      "useThemeMode must be used within a ThemeModeProvider"
    );
  }

  return context;
}