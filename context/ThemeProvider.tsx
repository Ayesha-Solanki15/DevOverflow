"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  mode: string;
  setMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState("");

  const handleThemeChange = () => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      // this is to checkout if the theme is dark or the theme as a key exists in localStorage and if it doesn't that means our current theme is system and if the user's OS suppots dark mode then we are explicitly setting the system theme as dark 
      setMode("dark");
      document.documentElement.classList.add("dark");
    } else {
      setMode("light");
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    console.log("I am running");
    handleThemeChange();
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
