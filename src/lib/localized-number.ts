export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/٬/g, ",")
    .replace(/٫/g, ".");
}
export function localizedDigits(value: string | number, fa: boolean) {
  const latin = normalizeDigits(String(value));
  return fa ? latin.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]) : latin;
}
