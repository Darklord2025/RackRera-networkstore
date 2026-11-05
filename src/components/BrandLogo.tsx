import { useLanguage } from "@/contexts/LanguageContext";
export default function BrandLogo({ print = false }: { print?: boolean } = {}) {
  const fa = useLanguage().language === "fa";
  return (
    <span className={"rv-wordmark" + (print ? " rv-wordmark-print" : "")}>
      <img src="/rackvira.svg" width="44" height="44" alt="" />
      <strong>{fa ? "رک‌ویرا" : "RackVira"}</strong>
    </span>
  );
}
