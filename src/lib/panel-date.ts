import { normalizeDigits } from "./localized-number";
const persianFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});
export function panelDate(value: string | number, fa: boolean) {
  const date = new Date(
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value + "T12:00:00Z"
      : value,
  );
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat(
    fa ? "fa-IR-u-ca-persian" : "en-GB-u-ca-gregory",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tehran",
    },
  ).format(date);
}
export function panelDateInput(value: string, fa: boolean) {
  const raw = normalizeDigits(value).trim();
  if (!raw) return "";
  if (!fa) {
    const d = new Date(raw + "T12:00:00Z");
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) &&
      Number.isFinite(d.getTime()) &&
      d.toISOString().slice(0, 10) === raw
      ? raw
      : null;
  }
  const m = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(raw);
  if (!m) return null;
  const [y, month, day] = m.slice(1).map(Number);
  if (y < 1300 || y > 1600 || month < 1 || month > 12 || day < 1 || day > 31)
    return null;
  const target = y * 10000 + month * 100 + day;
  let low = Math.floor(Date.UTC(y + 621, 0, 1) / 86400000),
    high = Math.floor(Date.UTC(y + 622, 11, 31) / 86400000);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2),
      d = new Date(mid * 86400000),
      parts = persianFormatter.formatToParts(d),
      get = (type: string) => Number(parts.find((p) => p.type === type)?.value),
      key = get("year") * 10000 + get("month") * 100 + get("day");
    if (key === target) return d.toISOString().slice(0, 10);
    if (key < target) low = mid + 1;
    else high = mid - 1;
  }
  return null;
}
