import { useLanguage } from "@/contexts/LanguageContext";
export default function LanguageControl() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      className="nv-theme-toggle"
      type="button"
      onClick={toggleLanguage}
      aria-label={
        language === "fa" ? "Switch to English" : "تغییر زبان به فارسی"
      }
    >
      {language === "fa" ? "EN" : "فا"}
    </button>
  );
}
