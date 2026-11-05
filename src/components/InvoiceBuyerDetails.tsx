import { useEffect, useState } from "react";
import { buyerFields, missingInvoiceBuyer } from "@/lib/invoice-buyer";
import { normalizeDigits } from "@/lib/localized-number";
import type { AccountProfile } from "@/lib/panel-model";

export default function InvoiceBuyerDetails({
  profile,
  fa,
  onChange,
  onSave,
  locked = false,
}: {
  profile: AccountProfile;
  fa: boolean;
  onChange?: (p: AccountProfile) => void;
  onSave?: (p: AccountProfile) => Promise<void>;
  locked?: boolean;
}) {
  const [draft, setDraft] = useState(profile),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => setDraft(profile), [profile]);
  const s = (f: string, e: string) => (fa ? f : e),
    missing = missingInvoiceBuyer(profile);
  return (
    <details
      className="invoice-buyer-editor rounded-xl border bg-card p-4 space-y-4"
      open={missing.length > 0 && !locked}
    >
      <summary className="cursor-pointer font-bold">
        {s(
          profile.kind === "company" ? "مشخصات حقوقی خریدار" : "مشخصات خریدار",
          profile.kind === "company"
            ? "Company buyer details"
            : "Buyer details",
        )}
        {missing.length > 0
          ? s(" — نیازمند تکمیل", " — incomplete")
          : s(" — از اطلاعات ثبت‌شده حساب", " — from your registered profile")}
      </summary>
      <p className="text-sm text-muted-foreground">
        {locked
          ? s(
              "این مشخصات بخشی از سند صادرشده است و در این صفحه تغییر نمی‌کند.",
              "These details belong to an issued document and cannot be changed here.",
            )
          : s(
              "همین مشخصات در نمایش، پیش‌فاکتور، چاپ و PDF استفاده می‌شود. تغییر اطلاعات هویتی تأییدشده تابع فرایند بررسی حساب است.",
              "These details are shared by the preview, proforma, print and PDF. Changes to verified identity follow account review.",
            )}
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          if (missingInvoiceBuyer(draft).length) {
            setError(
              s(
                "همه مشخصات خریدار را کامل کنید.",
                "Complete all buyer fields.",
              ),
            );
            return;
          }
          setBusy(true);
          try {
            if (onSave) await onSave(draft);
            onChange?.(draft);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {buyerFields(profile.kind === "company").map(([key, f, en]) => (
            <label className="flex flex-col gap-2 text-sm" key={key}>
              {s(f, en)}
              <input
                className="border rounded-lg p-3 bg-background min-w-0"
                required
                disabled={locked}
                readOnly={
                  !!onSave &&
                  profile.kind === "company" &&
                  [
                    "name",
                    "company",
                    "nationalId",
                    "economicCode",
                    "registrationNumber",
                  ].includes(key) &&
                  !!profile[key]
                }
                maxLength={key === "address" ? 500 : 150}
                value={String(draft[key] || "")}
                onChange={(e) => {
                  const value = [
                    "nationalId",
                    "economicCode",
                    "registrationNumber",
                    "postalCode",
                  ].includes(key)
                    ? normalizeDigits(e.target.value)
                    : e.target.value;
                  setDraft((p) => ({ ...p, [key]: value }));
                }}
              />
            </label>
          ))}
        </div>
        {error && (
          <p role="alert" className="text-destructive mt-3">
            {error}
          </p>
        )}
        {!locked && (
          <button
            className="mt-4 rounded-lg px-5 py-3 bg-primary text-primary-foreground disabled:opacity-60"
            type="submit"
            disabled={busy}
          >
            {s(
              onSave ? "ذخیره و اعمال مشخصات" : "اعمال مشخصات در این سند",
              onSave
                ? "Save and apply details"
                : "Apply details to this document",
            )}
          </button>
        )}
      </form>
    </details>
  );
}
