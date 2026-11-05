import { useEffect, useState } from "react";
import { usePanelData } from "@/contexts/PanelDataContext";
import { useSiteCopy } from "../public/site-copy";
import { buyerFields } from "@/lib/invoice-buyer";
export default function AccountProfileForm() {
  const panel = usePanelData(),
    { s, fa } = useSiteCopy();
  const [profile, set] = useState(panel.data.profile),
    [message, note] = useState(""),
    [busy, working] = useState(false);
  useEffect(() => set(panel.data.profile), [panel.data.profile]);
  return (
    <form
      className="nv-shop-account-card rv-profile"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        working(true);
        note("");
        try {
          await panel.saveProfile(profile);
          note(s("مشخصات ذخیره شد.", "Billing profile saved."));
        } catch {
          note(s("ذخیره نشد.", "Could not save the profile."));
        } finally {
          working(false);
        }
      }}
    >
      <h2>{s("مشخصات پیش‌فرض خریدار", "Default buyer details")}</h2>
      <label>
        {s("نوع خریدار", "Buyer type")}
        <select
          value={profile.kind}
          onChange={(e) =>
            set({
              ...profile,
              kind: e.target.value === "company" ? "company" : "personal",
            })
          }
        >
          <option value="personal">{s("حقیقی", "Individual")}</option>
          <option value="company">{s("حقوقی", "Company")}</option>
        </select>
      </label>
      {buyerFields(profile.kind === "company").map(
        ([key, faLabel, enLabel]) => (
          <label key={key}>
            {fa ? faLabel : enLabel}
            <input
              value={profile[key]}
              readOnly={key === "email"}
              onChange={(e) => set({ ...profile, [key]: e.target.value })}
            />
          </label>
        ),
      )}
      <button
        className="nv-button"
        disabled={!panel.ready || !!panel.error || busy}
      >
        {s("ذخیره مشخصات", "Save details")}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
