import { useLanguage } from "@/contexts/LanguageContext";
import { localizedDigits } from "@/lib/localized-number";
export function useSiteCopy() {
  const fa = useLanguage().language === "fa";
  const s = <T>(a: T, b: T): T => (fa ? a : b);
  const text = <T>(v: readonly [T, T]): T => s(v[0], v[1]);
  const n = (v: string | number) => localizedDigits(String(v), fa);
  const money = (v: number) =>
    new Intl.NumberFormat(fa ? "fa-IR" : "en-US").format(v) +
    s(" تومان", " Toman");
  return { fa, s, text, n, money };
}
