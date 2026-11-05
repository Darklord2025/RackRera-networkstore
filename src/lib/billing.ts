import { localizedDigits } from "./localized-number";
export type InvoiceStatus = "Paid" | "Unpaid" | "Overdue" | "Cancelled";
export type Currency = "IRR" | "TOMAN";
export interface InvoiceData {
  id: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: {
    name: string;
    description?: string;
    quantity: number;
    price: number;
    period?: string;
  }[];
  currency: Currency;
  tax?: number;
  discount?: number;
  customer?: string;
  proforma?: boolean;
  demo?: boolean;
  buyer?: {
    kind: "personal" | "company";
    name: string;
    company: string;
    nationalId: string;
    economicCode: string;
    registrationNumber: string;
    postalCode: string;
    address: string;
  };
  officialNumber?: string;
}
export function invoiceTotals(invoice: InvoiceData) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (
    invoice.items.some(
      (i) =>
        !Number.isFinite(i.price) ||
        i.price < 0 ||
        !Number.isInteger(i.quantity) ||
        i.quantity < 1,
    )
  )
    throw new Error("Invalid invoice amounts");
  const tax = invoice.tax ?? 0,
    discount = invoice.discount ?? 0;
  if (
    ![tax, discount].every((n) => Number.isFinite(n) && n >= 0) ||
    discount > subtotal + tax
  )
    throw new Error("Invalid invoice adjustments");
  return { subtotal, total: subtotal + tax - discount };
}
// Catalog amounts are explicitly IRR; legacy cart prices are explicitly Toman.
export const inToman = (amount: number, currency: Currency) =>
  currency === "IRR" ? amount / 10 : amount;
export const canPayInvoice = (status: InvoiceStatus) =>
  status === "Unpaid" || status === "Overdue";
export const statusLabels: Record<InvoiceStatus, [string, string]> = {
  Paid: ["پرداخت شده", "Paid"],
  Unpaid: ["پرداخت نشده", "Unpaid"],
  Overdue: ["معوقه", "Overdue"],
  Cancelled: ["لغو شده", "Cancelled"],
};
export const localize = localizedDigits;
export function formatMoney(amount: number, currency: Currency, fa: boolean) {
  return `${localize(inToman(amount, currency).toLocaleString("en-US", { maximumFractionDigits: 1 }), fa)}\u00a0${fa ? "تومان" : "Toman"}`;
}
