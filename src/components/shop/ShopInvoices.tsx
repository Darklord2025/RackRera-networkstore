import { useState } from "react";
import { FileText } from "lucide-react";
import ShopInvoice from "../public/ShopInvoice";
import type { ShopSnapshot } from "../../../supabase/functions/_shared/shop-model";
import type { InvoiceData } from "@/lib/billing";
import type { RetailInvoiceDetails } from "@/lib/retail-invoice";
import { invoiceTotals } from "@/lib/billing";
import { usePanelCopy } from "../user-panel/PanelPrimitives";

export default function ShopInvoices({
  documents = [],
  preview = false,
}: {
  documents: ShopSnapshot["documents"];
  preview?: boolean;
}) {
  const { s } = usePanelCopy(),
    [selected, setSelected] = useState<string | null>(null);
  const valid = documents.filter((d) => {
    try {
      const i = d.invoice as unknown as InvoiceData;
      invoiceTotals(i);
      return (
        ["TOMAN", "IRR"].includes(i.currency) && Array.isArray(d.retail.lines)
      );
    } catch {
      return false;
    }
  });
  const active = valid.find((d) => d.id === selected);
  if (active || selected === "template")
    return (
      <ShopInvoice
        lines={[]}
        documentData={active?.invoice as unknown as InvoiceData | undefined}
        retailData={
          active?.retail as unknown as RetailInvoiceDetails | undefined
        }
        onBack={() => setSelected(null)}
      />
    );
  return (
    <section className="nv-shop-account-card">
      <h2 className="text-xl font-bold mb-4">
        {s(
          "پیش‌فاکتورها و فاکتورهای خرید تجهیزات",
          "Equipment proformas and invoices",
        )}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">
        {s(
          "مشخصات حقوقی از حساب رک‌ویرا خوانده می‌شود. اسناد صادرشده، مشخصات ثبت‌شده هنگام صدور را حفظ می‌کنند.",
          "Company details come from your RackVira billing profile. Issued documents retain their original buyer snapshot.",
        )}
      </p>
      {!valid.length && (
        <p className="rounded-xl border p-5 mb-5">
          {s(
            "هنوز سند خرید تجهیزات صادر نشده است.",
            "No equipment purchase document has been issued yet.",
          )}
        </p>
      )}
      <div className="space-y-3">
        {valid.map((d) => (
          <button
            type="button"
            className="rv-document-row"
            key={d.id}
            onClick={() => setSelected(d.id)}
          >
            <FileText size={23} />
            <span>
              {d.kind === "official"
                ? s("فاکتور رسمی", "Official invoice")
                : s("پیش‌فاکتور رسمی", "Company proforma")}{" "}
              · {String(d.invoice.id)}
            </span>
          </button>
        ))}
      </div>
      <button
        className="nv-button mt-5"
        type="button"
        onClick={() => setSelected("template")}
      >
        {s(
          "مشاهده الگوی پیش‌فاکتور با مشخصات حساب",
          "Preview template with your account details",
        )}
      </button>
      {preview && (
        <p className="mt-4 text-sm text-muted-foreground">
          {s(
            "حالت نمایشی؛ سند رسمی صادر نمی‌شود.",
            "Preview mode. No official document is issued.",
          )}
        </p>
      )}
    </section>
  );
}
