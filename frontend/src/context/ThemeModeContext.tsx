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

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);
const STORAGE_KEY = "fedsentry_theme_mode";

function getInitialMode(): PaletteMode {
  const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("sentinelai_theme_mode");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.setAttribute("data-theme", mode);
    root.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;

    const tokens = mode === "dark"
      ? {
          "--page-bg": "#34322e",
          "--surface": "#53504a",
          "--surface-muted": "#5c5952",
          "--surface-elevated": "#605d56",
          "--surface-soft": "rgba(255,255,255,.055)",
          "--border": "rgba(255,255,255,.12)",
          "--border-strong": "rgba(255,255,255,.20)",
          "--text-primary": "#f8f6f1",
          "--text-secondary": "#ddd8cf",
          "--text-muted": "rgba(248,246,241,.68)",
          "--text-subtle": "rgba(248,246,241,.46)",
          "--shadow-sm": "0 8px 24px rgba(24,22,20,.16)",
          "--shadow-md": "0 16px 40px rgba(24,22,20,.22)",
          "--shadow-lg": "0 24px 64px rgba(24,22,20,.28)",
          "--glass-bg": "rgba(83,80,74,.88)",
          "--glass-bg-strong": "rgba(66,64,59,.96)",
          "--glass-border": "rgba(255,255,255,.12)",
        }
      : {
          "--page-bg": "#e9e4dc",
          "--surface": "#f7f3ed",
          "--surface-muted": "#eee8df",
          "--surface-elevated": "#fffdf9",
          "--surface-soft": "rgba(255,255,255,.62)",
          "--border": "rgba(74,68,60,.14)",
          "--border-strong": "rgba(74,68,60,.24)",
          "--text-primary": "#2f2c28",
          "--text-secondary": "#514c45",
          "--text-muted": "#706a62",
          "--text-subtle": "#948d84",
          "--shadow-sm": "0 8px 24px rgba(63,57,49,.08)",
          "--shadow-md": "0 16px 40px rgba(63,57,49,.10)",
          "--shadow-lg": "0 24px 64px rgba(63,57,49,.14)",
          "--glass-bg": "rgba(247,243,237,.90)",
          "--glass-bg-strong": "rgba(255,253,249,.96)",
          "--glass-border": "rgba(74,68,60,.14)",
        };

    Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#f27c52" },
          secondary: { main: mode === "dark" ? "#78aeb6" : "#5d8f98" },
          success: { main: mode === "dark" ? "#63c567" : "#4da861" },
          warning: { main: mode === "dark" ? "#f4b24f" : "#d89a39" },
          error: { main: mode === "dark" ? "#e7655c" : "#cf5f57" },
          info: { main: mode === "dark" ? "#78aeb6" : "#5d8f98" },
          background: mode === "dark"
            ? { default: "#34322e", paper: "#53504a" }
            : { default: "#e9e4dc", paper: "#f7f3ed" },
          text: mode === "dark"
            ? { primary: "#f8f6f1", secondary: "rgba(248,246,241,.68)" }
            : { primary: "#2f2c28", secondary: "#706a62" },
          divider: mode === "dark" ? "rgba(255,255,255,.12)" : "rgba(74,68,60,.14)",
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: "'DM Sans', 'Segoe UI', Roboto, system-ui, sans-serif",
          h1: { fontWeight: 700, letterSpacing: "-0.04em" },
          h2: { fontWeight: 700, letterSpacing: "-0.035em" },
          h3: { fontWeight: 700, letterSpacing: "-0.025em" },
          h4: { fontWeight: 700, letterSpacing: "-0.02em" },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          button: { textTransform: "none", fontWeight: 700 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              html: {
                minHeight: "100%",
                backgroundColor: mode === "dark" ? "#34322e" : "#e9e4dc",
                transition: "background-color 180ms ease, color 180ms ease",
              },
              body: {
                minHeight: "100%",
                margin: 0,
                backgroundColor: mode === "dark" ? "#34322e" : "#e9e4dc",
                color: mode === "dark" ? "#f8f6f1" : "#2f2c28",
                transition: "background-color 180ms ease, color 180ms ease",
              },
              "*": { boxSizing: "border-box" },
              "*::selection": {
                backgroundColor: mode === "dark" ? "rgba(242,124,82,.30)" : "rgba(242,124,82,.20)",
              },
              "button, input, textarea, select": { font: "inherit" },
              "button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible": {
                outline: "none",
                boxShadow: "0 0 0 3px rgba(242,124,82,.18)",
              },
              "::-webkit-scrollbar": { width: "8px", height: "8px" },
              "::-webkit-scrollbar-track": { background: mode === "dark" ? "#302f2b" : "#ded8cf" },
              "::-webkit-scrollbar-thumb": { background: mode === "dark" ? "#69655e" : "#aaa197", borderRadius: "999px" },
            },
          },
          MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
          MuiButton: { styleOverrides: { root: { borderRadius: 12, minHeight: 42 } } },
          MuiTextField: { defaultProps: { variant: "outlined" } },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                transition: "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(242,124,82,.42)" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 1, borderColor: "#f27c52" },
              },
              notchedOutline: { borderColor: mode === "dark" ? "rgba(255,255,255,.14)" : "rgba(74,68,60,.16)" },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 18,
                backgroundImage: "none",
                border: mode === "dark" ? "1px solid rgba(255,255,255,.12)" : "1px solid rgba(74,68,60,.14)",
                boxShadow: mode === "dark" ? "0 16px 45px rgba(24,22,20,.22)" : "0 16px 45px rgba(63,57,49,.08)",
              },
            },
          },
          MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
          MuiDialog: { styleOverrides: { paper: { borderRadius: 20, backgroundImage: "none" } } },
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, isDarkMode: mode === "dark", toggleMode, toggleThemeMode: toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error("useThemeMode must be used within a ThemeModeProvider");
  return context;
}
