import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  InvoiceData,
  invoiceTotals,
  localize,
  formatMoney,
  inToman,
  statusLabels,
} from "@/lib/billing";
import BrandLogo from "@/components/BrandLogo";
import { panelDate } from "@/lib/panel-date";
import type { RetailInvoiceDetails } from "@/lib/retail-invoice";
export type InvoiceDocumentData = InvoiceData;
export const InvoiceDocument: React.FC<{
  invoice: InvoiceData;
  id?: string;
  language?: "fa" | "en";
  retail?: RetailInvoiceDetails;
  branding?: React.ReactNode;
}> = ({ invoice, id, language: override, retail, branding }) => {
  const { language } = useLanguage();
  const fa = (override ?? language) === "fa",
    s = (f: string, e: string) => (fa ? f : e),
    n = (v: string | number) => localize(v, fa),
    money = (v: number) => (
      <span className="invoice-money">
        <bdi dir="ltr">
          {n(
            inToman(v, invoice.currency).toLocaleString("en-US", {
              maximumFractionDigits: 1,
            }),
          )}
        </bdi>
        <small>{s("تومان", "Toman")}</small>
      </span>
    );
  const { subtotal, total } = invoiceTotals(invoice),
    buyer = invoice.buyer,
    company = buyer?.kind === "company",
    paid = invoice.status === "Paid";
  const title =
    invoice.status === "Cancelled"
      ? s("صورتحساب لغوشده", "Cancelled invoice")
      : invoice.officialNumber
        ? s("فاکتور رسمی", "Official invoice")
        : retail
          ? s(
              invoice.proforma || !paid
                ? company
                  ? "پیش‌فاکتور رسمی فروش کالا"
                  : "پیش‌فاکتور فروش کالا"
                : "فاکتور فروش کالا",
              invoice.proforma || !paid
                ? "Equipment proforma"
                : "Equipment sales invoice",
            )
          : invoice.proforma || !paid
            ? s(
                company ? "پیش‌فاکتور رسمی حقوقی" : "پیش‌فاکتور خدمات",
                company ? "Company proforma invoice" : "Service proforma",
              )
            : s(
                company ? "صورتحساب حقوقی" : "صورتحساب خدمات",
                company ? "Company invoice" : "Service invoice",
              );
  return (
    <article
      id={id}
      className={
        "invoice-document invoice-v2" + (retail ? " invoice-retail" : "")
      }
      dir={fa ? "rtl" : "ltr"}
    >
      <header className="invoice-heading">
        <div>
          {branding ?? <BrandLogo />}
          <p>
            {retail
              ? s("فروشگاه تجهیزات شبکه", "Network equipment store")
              : s(
                  "راهکارهای میزبانی و زیرساخت ابری",
                  "Cloud infrastructure and hosting",
                )}
          </p>
        </div>
        <div className="invoice-heading-meta">
          <h2>{title}</h2>
          <span className={"invoice-state " + (paid ? "is-paid" : "")}>
            {statusLabels[invoice.status][fa ? 0 : 1]}
          </span>
          <small className="invoice-reference" dir="ltr">
            {n(invoice.id)}
          </small>
        </div>
      </header>
      {invoice.demo && (
        <p className="invoice-demo">
          {s(
            "پیش‌نمایش نمونه؛ این سند، تایید پرداخت یا سند رسمی مالیاتی نیست.",
            "Sample preview; this is not a payment confirmation or an issued tax document.",
          )}
        </p>
      )}
      <section className="invoice-parties">
        <div>
          <span className="invoice-label">{s("فروشنده", "Seller")}</span>
          <strong>{s("رک‌ویرا", "RackVira")}</strong>
          <p>
            {retail
              ? s("فروش تجهیزات نو و استوک", "New and pre-owned equipment")
              : s(
                  "خدمات میزبانی و زیرساخت",
                  "Hosting and infrastructure services",
                )}
          </p>
        </div>
        <div>
          <span className="invoice-label">{s("خریدار", "Buyer")}</span>
          <strong>
            {company
              ? buyer.company
              : buyer?.name ||
                invoice.customer ||
                s("اطلاعات خریدار ارائه نشده", "Buyer details not provided")}
          </strong>
          {company && buyer?.name && (
            <p>
              {s("نماینده خریدار", "Buyer contact")}: {buyer.name}
            </p>
          )}
          {buyer?.nationalId && (
            <p>
              {s(
                company ? "شناسه ملی" : "کد ملی",
                company ? "Company ID" : "National ID",
              )}
              : {n(buyer.nationalId)}
            </p>
          )}
          {buyer?.economicCode && (
            <p>
              {s("کد اقتصادی", "Economic code")}: {n(buyer.economicCode)}
            </p>
          )}
          {company && buyer?.registrationNumber && (
            <p>
              {s("شماره ثبت", "Registration number")}:{" "}
              {n(buyer.registrationNumber)}
            </p>
          )}
          {buyer?.address && (
            <p>
              {buyer.address} {n(buyer.postalCode)}
            </p>
          )}
        </div>
      </section>
      <dl className="invoice-metadata">
        <div>
          <dt>{s("شماره صورتحساب", "Invoice number")}</dt>
          <dd dir="ltr">{n(invoice.id)}</dd>
        </div>
        <div>
          <dt>{s("تاریخ صدور", "Issue date")}</dt>
          <dd>
            {n(
              /^\d{4}-\d{2}-\d{2}/.test(invoice.issueDate)
                ? panelDate(invoice.issueDate, fa)
                : invoice.issueDate,
            )}
          </dd>
        </div>
        <div>
          <dt>
            {retail
              ? s("شماره سفارش", "Order reference")
              : s("سررسید", "Due date")}
          </dt>
          <dd>
            {retail
              ? retail.orderNumber
              : n(invoice.dueDate || s("تعیین نشده", "Not assigned"))}
          </dd>
        </div>
        <div>
          <dt>{s("واحد مبلغ", "Currency")}</dt>
          <dd>{s("تومان", "Toman")}</dd>
        </div>
      </dl>
      <section className="invoice-lines">
        <div className="invoice-line invoice-column-labels">
          <span>
            {retail
              ? s("شرح کالا / وضعیت / گارانتی", "Item / condition / warranty")
              : s("شرح خدمات", "Description")}
          </span>
          <span>{s("تعداد", "Qty")}</span>
          <span>{s("مبلغ واحد", "Unit price")}</span>
          <span>{s("مبلغ کل", "Line total")}</span>
        </div>
        {invoice.items.map((item, i) => (
          <div key={i} className="invoice-line">
            <div>
              <strong>{n(item.name)}</strong>
              {item.description && <p>{n(item.description)}</p>}
              {item.period && <small>{n(item.period)}</small>}
              {retail?.lines[i] && (
                <dl
                  className="invoice-retail-item-meta"
                  data-retail-sku={retail.lines[i].sku}
                >
                  <div>
                    <dt>{s("کد کالا", "SKU")}</dt>
                    <dd dir="ltr">{retail.lines[i].sku}</dd>
                  </div>
                  <div>
                    <dt>{s("وضعیت", "Condition")}</dt>
                    <dd>{retail.lines[i].condition}</dd>
                  </div>
                  <div>
                    <dt>{s("گارانتی", "Warranty")}</dt>
                    <dd>{n(retail.lines[i].warranty)}</dd>
                  </div>
                  {retail.lines[i].grade && (
                    <div>
                      <dt>{s("گرید / تست", "Grade / testing")}</dt>
                      <dd>{retail.lines[i].grade}</dd>
                    </div>
                  )}
                  <div>
                    <dt>{s("سریال", "Serial")}</dt>
                    <dd>
                      {retail.lines[i].serials.length
                        ? retail.lines[i].serials.join(" · ")
                        : s("هنوز ثبت نشده", "Not recorded yet")}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
            <span>{n(item.quantity)}</span>
            <span>{money(item.price)}</span>
            <strong>{money(item.price * item.quantity)}</strong>
          </div>
        ))}
      </section>
      <section className="invoice-bottom">
        <div className="invoice-note">
          <strong>{s("یادداشت صورتحساب", "Invoice notes")}</strong>
          <p>
            {retail
              ? retail.shipping
              : s(
                  "شناسه صورتحساب را در مکاتبات و رسید پرداخت درج کنید.",
                  "Include the invoice number in correspondence and payment receipts.",
                )}
          </p>
          <p>
            {retail
              ? s(
                  "شرایط مرجوعی، تست سلامت و مدت و شرکت گارانتی باید در فاکتور نهایی تأیید شوند؛ این نمونه ضمانت‌نامه نیست.",
                  "Return terms, test results, warranty duration and provider must be confirmed on the final invoice. This example is not a warranty certificate.",
                )
              : s(
                  "کارمزد بانک یا شبکه پرداخت هنگام پرداخت اعلام می‌شود.",
                  "Bank or network charges are disclosed at checkout.",
                )}
          </p>
          {invoice.currency === "IRR" && (
            <p>
              {s(
                "مبالغ مرجع ریال هستند؛ هر تومان برابر ۱۰ ریال است.",
                "Source amounts are in IRR; one Toman equals 10 IRR.",
              )}
            </p>
          )}
          {invoice.officialNumber && (
            <p>
              {s("شماره سند رسمی", "Official document number")}:{" "}
              {n(invoice.officialNumber)}
            </p>
          )}
        </div>
        <dl className="invoice-totals">
          <div>
            <dt>
              {retail
                ? s("جمع کالاها", "Items subtotal")
                : s("جمع خدمات", "Subtotal")}
            </dt>
            <dd>{money(subtotal)}</dd>
          </div>
          {invoice.discount !== undefined && (
            <div>
              <dt>{s("تخفیف", "Discount")}</dt>
              <dd>{money(invoice.discount)}</dd>
            </div>
          )}
          {invoice.tax !== undefined && (
            <div>
              <dt>{s("مالیات ارزش افزوده (۱۰٪)", "VAT (10%)")}</dt>
              <dd>{money(invoice.tax)}</dd>
            </div>
          )}
          <div className="invoice-grand-total">
            <dt>
              {retail && invoice.demo
                ? s(
                    "جمع برآورد، بدون ارسال",
                    "Estimated total, delivery excluded",
                  )
                : invoice.status === "Cancelled"
                  ? s("جمع سند لغوشده", "Cancelled total")
                  : paid
                    ? s("مبلغ پرداخت شده", "Amount paid")
                    : s("مبلغ قابل پرداخت", "Amount due")}
            </dt>
            <dd>{money(total)}</dd>
          </div>
        </dl>
      </section>
      <footer className="invoice-footer">
        <span>
          {s("از اعتماد شما سپاسگزاریم", "Thank you for choosing RackVira")}
        </span>
        <span dir="ltr">RackVira · {n(invoice.id)}</span>
      </footer>
    </article>
  );
};
