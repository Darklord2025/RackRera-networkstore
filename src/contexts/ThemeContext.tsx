import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const Context = createContext({ theme: "light", toggleTheme: () => {} });
export const useTheme = () => useContext(Context);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, set] = useState(() =>
    localStorage.getItem("rackvira.theme") === "dark" ? "dark" : "light",
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("rackvira.theme", theme);
  }, [theme]);
  return (
    <Context.Provider
      value={{
        theme,
        toggleTheme: () => set((v) => (v === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </Context.Provider>
  );
}
