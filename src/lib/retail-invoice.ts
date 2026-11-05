import type { InvoiceData } from "./billing";
import {
  equipmentProfiles,
  equipmentTotals,
  equipmentCondition,
  equipmentWarranty,
} from "@/data/equipmentStore";

export interface RetailInvoiceDetails {
  orderNumber: string;
  shipping: string;
  lines: {
    sku: string;
    condition: string;
    warranty: string;
    serials: string[];
    grade?: string;
  }[];
}

/** Design preview only. Issued invoices must come from the verified server order. */
export function equipmentInvoice(
  lines: { id: string; quantity: number }[],
  issueDate: string,
  fa: boolean,
): { invoice: InvoiceData; retail: RetailInvoiceDetails } {
  const totals = equipmentTotals(lines);
  const products = lines.map((line) => ({
    line,
    product: equipmentProfiles.find((p) => p.id === line.id)!,
  }));
  return {
    invoice: {
      id: "SAMPLE-STORE",
      issueDate,
      dueDate: "",
      status: "Unpaid",
      currency: "TOMAN",
      proforma: true,
      demo: true,
      discount: 0,
      tax: totals.tax,
      items: products.map(({ line, product: p }) => ({
        name: p.name[fa ? 0 : 1],
        description: p.specs.map((v) => v[fa ? 0 : 1]).join(" · "),
        quantity: line.quantity,
        price: p.price,
      })),
    },
    retail: {
      orderNumber: fa
        ? "سبد نمونه؛ سفارش ثبت نشده"
        : "Sample cart; no order placed",
      shipping: fa
        ? "هزینه و روش ارسال پس از استعلام"
        : "Delivery method and cost require a quote",
      lines: products.map(({ product: p }) => ({
        sku: p.id,
        condition: equipmentCondition(p, fa),
        warranty: equipmentWarranty(p, fa),
        serials: [],
        grade:
          p.condition === "used"
            ? fa
              ? "گرید و تست فنی در انتظار تأیید"
              : "Grade and test report pending"
            : undefined,
      })),
    },
  };
}
