import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { PaletteMode } from "@mui/material";

interface ThemeModeContextValue {
  mode: PaletteMode;
  isDarkMode: boolean;
  toggleMode: () => void;
  toggleThemeMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "sentinelai_theme_mode";

function getInitialMode(): PaletteMode {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === "light" || saved === "dark") {
    return saved;
  }

  // Default theme when application starts
  return "light";
}

export function ThemeModeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#c084fc" : "#7c3aed",
          },
          background:
            mode === "dark"
              ? {
                  default: "#0f1117",
                  paper: "#171923",
                }
              : {
                  default: "#f6f7fb",
                  paper: "#ffffff",
                },
        },
        shape: {
          borderRadius: 10,
        },
        typography: {
          fontFamily:
            "'Segoe UI', Roboto, system-ui, -apple-system, sans-serif",
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