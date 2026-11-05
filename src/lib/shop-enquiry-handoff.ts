import { equipmentProfiles } from "@/data/equipmentStore";
export const shopEnquiryDraftKey = "rackvira.enquiryDraft";
export function equipmentEnquiryDraft(
  raw: string | null,
  fa: boolean,
  now = Date.now(),
): string {
  try {
    const data = JSON.parse(raw || "null");
    if (
      !data ||
      !Number.isFinite(data.at) ||
      now - data.at < 0 ||
      now - data.at > 3600000 ||
      !Array.isArray(data.lines) ||
      data.lines.length > equipmentProfiles.length ||
      new Set(data.lines.map((l: any) => l?.id)).size !== data.lines.length
    )
      return "";
    const rows = data.lines.map((line: any) => {
      const p = equipmentProfiles.find((p) => p.id === line.id);
      if (
        !p ||
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 99
      )
        throw Error("Invalid reference line");
      return `${p.name[fa ? 0 : 1]} (${p.id}) × ${line.quantity}`;
    });
    return rows.length
      ? `${fa ? "درخواست بررسی و پیش‌فاکتور برای اقلام منتخب؛ قیمت و موجودی نیازمند تأیید است:" : "Request a review and proforma for these selections. Pricing and availability require confirmation:"}\n${rows.join("\n")}`
      : "";
  } catch {
    return "";
  }
}
