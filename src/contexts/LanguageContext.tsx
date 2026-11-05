import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const Context = createContext({ language: "fa", toggleLanguage: () => {} });
export const useLanguage = () => useContext(Context);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, set] = useState(() =>
    localStorage.getItem("rackvira.language") === "en" ? "en" : "fa",
  );
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
    localStorage.setItem("rackvira.language", language);
  }, [language]);
  return (
    <Context.Provider
      value={{
        language,
        toggleLanguage: () => set((v) => (v === "fa" ? "en" : "fa")),
      }}
    >
      {children}
    </Context.Provider>
  );
}
