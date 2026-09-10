import {
  createContext,
  useMemo,
  useState,
} from "react";

import {
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

import { getTheme } from "./theme";

export const ColorModeContext =
  createContext();

export default function ThemeContextProvider({
  children,
}) {
  const [mode, setMode] =
    useState(
      localStorage.getItem("theme") || "dark"
    );

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {

        const newMode =
          mode === "dark"
            ? "light"
            : "dark";

        setMode(newMode);

        localStorage.setItem(
          "theme",
          newMode
        );
      },
    }),
    [mode]
  );

  const theme = useMemo(
    () => getTheme(mode),
    [mode]
  );

  return (
    <ColorModeContext.Provider
      value={{
        toggleColorMode:
          colorMode.toggleColorMode,
        mode,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {children}

      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}