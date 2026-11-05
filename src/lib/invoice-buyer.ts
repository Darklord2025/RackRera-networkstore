import type { InvoiceData } from "./billing";
import type { AccountProfile } from "./panel-model";

export function buyerFields(company: boolean) {
  const fields: (readonly [keyof AccountProfile, string, string])[] = [
    ["name", "نام و نام خانوادگی نماینده", "Contact full name"],
  ];
  if (company)
    fields.push(
      ["company", "نام کامل شرکت", "Registered company name"],
      ["nationalId", "شناسه ملی شرکت", "Company national ID"],
      ["economicCode", "کد اقتصادی", "Economic code"],
      ["registrationNumber", "شماره ثبت", "Registration number"],
    );
  else fields.push(["nationalId", "کد ملی", "National ID"]);
  fields.push(
    ["postalCode", "کد پستی", "Postal code"],
    ["address", "نشانی کامل", "Full address"],
  );
  return fields;
}

export function missingInvoiceBuyer(profile: Partial<AccountProfile>) {
  return buyerFields(profile.kind === "company")
    .filter(([key]) => !String(profile[key] || "").trim())
    .map(([key]) => key);
}

/** Issued buyer snapshots are immutable; new drafts default to the registered identity. */
export function resolveInvoiceBuyer(
  invoice: InvoiceData,
  profile: AccountProfile,
): AccountProfile {
  if (invoice.officialNumber || invoice.status === "Paid")
    return { ...profile, ...(invoice.buyer || {}) };
  const registered = Object.fromEntries(
    Object.entries(profile).filter(([, value]) => String(value).trim() !== ""),
  );
  return {
    ...profile,
    ...(invoice.buyer?.kind === profile.kind ? invoice.buyer : {}),
    ...registered,
  } as AccountProfile;
}
