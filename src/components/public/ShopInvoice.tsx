import { useRef, useState } from "react";
import {
  Download,
  Printer,
  ArrowRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { InvoiceDocument } from "@/components/user-panel/InvoiceDocument";
import { equipmentInvoice } from "@/lib/retail-invoice";
import { panelDate } from "@/lib/panel-date";
import { useSiteCopy } from "./site-copy";
import PublicBrandLogo from "./PublicBrandLogo";
import "./retail-invoice.css";
import { useOptionalPanelData } from "@/contexts/PanelDataContext";
import { emptyProfile, type AccountProfile } from "@/lib/panel-model";
import { resolveInvoiceBuyer, missingInvoiceBuyer } from "@/lib/invoice-buyer";
import InvoiceBuyerDetails from "@/components/InvoiceBuyerDetails";
import type { InvoiceData } from "@/lib/billing";
import type { RetailInvoiceDetails } from "@/lib/retail-invoice";

export default function ShopInvoice({
  lines,
  onBack,
  documentData,
  retailData,
}: {
  lines: { id: string; quantity: number }[];
  onBack: () => void;
  documentData?: InvoiceData;
  retailData?: RetailInvoiceDetails;
}) {
  const { s, fa } = useSiteCopy(),
    host = useRef<HTMLDivElement>(null),
    lock = useRef(false);
  const panel = useOptionalPanelData();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [buyerOverride, setBuyerOverride] = useState<AccountProfile | null>(null);
  const preview = equipmentInvoice(
    lines.length
      ? lines
      : [
          { id: "core-24-stock", quantity: 1 },
          { id: "link-10", quantity: 2 },
        ],
    panelDate(new Date().toISOString(), fa),
    fa,
  );
  const base = documentData || preview.invoice;
  const buyer =
    documentData?.buyer ||
    buyerOverride ||
    resolveInvoiceBuyer(base, panel?.data.profile || emptyProfile);
  const invoice = { ...base, buyer };
  const locked = !!documentData;
  const unavailable = !locked && !!panel && (!panel.ready || !!panel.error);
  const incomplete =
    buyer.kind === "company" && missingInvoiceBuyer(buyer).length > 0;
  async function exportDocument(mode: "pdf" | "print") {
    if (lock.current || incomplete || unavailable) return;
    const element =
      host.current?.querySelector<HTMLElement>(".invoice-document");
    if (!element) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const { downloadInvoice, printInvoice } = await import(
        "@/lib/invoice-export"
      );
      if (mode === "pdf")
        await downloadInvoice(
          element,
          locked
            ? "RackVira-" + invoice.id.replace(/[^A-Za-z0-9-]/g, "-")
            : "RackVira-preview",
        );
      else await printInvoice(element);
    } catch {
      setError(
        s(
          "خروجی آماده نشد؛ دوباره تلاش کنید.",
          "Export failed. Please try again.",
        ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="nv-container nv-retail-invoice-page">
      <div className="nv-retail-invoice-toolbar">
        <div>
          <span className="nv-eyebrow">
            {s("فاکتور فروشگاه تجهیزات", "EQUIPMENT INVOICE")}
          </span>
          <h1>
            {invoice.officialNumber
              ? s("فاکتور رسمی خرید کالا", "Official equipment invoice")
              : s("پیش‌فاکتور خرید کالا", "Equipment purchase proforma")}
          </h1>
        </div>
        <button type="button" className="nv-back-button" onClick={onBack}>
          {fa ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}{" "}
          {s("بازگشت به فاکتورها", "Back to invoices")}
        </button>
      </div>
      <div className="nv-retail-invoice-tools">
        <p>
          <FileText size={21} />
          {documentData && !documentData.demo
            ? s(
                "سند ثبت‌شده خرید تجهیزات؛ مشخصات خریدار هنگام صدور حفظ شده است.",
                "Registered equipment document. The original buyer details are retained.",
              )
            : s(
                "نمونهٔ قالب فروشگاهی؛ پرداخت، سفارش یا ضمانت‌نامه‌ای صادر نشده است.",
                "Retail template preview. No payment, order or warranty certificate has been issued.",
              )}
        </p>
        <div>
          <button
            className="nv-button"
            type="button"
            disabled={busy || incomplete || unavailable}
            onClick={() => exportDocument("pdf")}
          >
            <Download size={18} />
            {s("دانلود PDF", "Download PDF")}
          </button>
          <button
            className="nv-button nv-button-outline"
            type="button"
            disabled={busy || incomplete || unavailable}
            onClick={() => exportDocument("print")}
          >
            <Printer size={18} />
            {s("چاپ فاکتور", "Print invoice")}
          </button>
        </div>
      </div>
      <InvoiceBuyerDetails
        profile={{ ...emptyProfile, ...buyer }}
        fa={fa}
        locked={locked}
        onChange={setBuyerOverride}
        onSave={
          panel && !locked
            ? async (p) => {
                await panel.saveProfile(p);
                setBuyerOverride(p);
              }
            : undefined
        }
      />
      {incomplete && (
        <p role="status" className="text-sm text-amber-700 my-4">
          {s(
            "برای پیش‌فاکتور و فاکتور حقوقی، تمام مشخصات شرکت را کامل کنید.",
            "Complete every company buyer field before exporting a company document.",
          )}
        </p>
      )}
      {unavailable && (
        <p role="status">
          {s(
            "اطلاعات حساب در دسترس نیست؛ خروجی تا دریافت مشخصات غیرفعال است.",
            "Account data is unavailable. Export waits for buyer details.",
          )}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="nv-retail-paper" ref={host}>
        <InvoiceDocument
          invoice={invoice}
          retail={retailData || preview.retail}
          branding={<PublicBrandLogo print />}
        />
      </div>
    </section>
  );
}
