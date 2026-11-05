export interface ShopAddress {
  id: string;
  label: string;
  recipient: string;
  city: string;
  postalCode: string;
  street: string;
  country: "IR";
}
export interface ShopOrder {
  id: string;
  number: number;
  status: string;
  createdAt: string;
  description: string;
  quantity: number;
  totalToman: number | null;
  tracking?: string;
  address?: Omit<ShopAddress, "id">;
}
export interface ShopSnapshot {
  documents?: {
    id: string;
    kind: "proforma" | "official";
    createdAt: string;
    invoice: Record<string, unknown>;
    retail: Record<string, unknown>;
  }[];
  orders: ShopOrder[];
  addresses: ShopAddress[];
  favorites: { id: string; nameFa: string; nameEn: string }[];
}
export const blankShopSnapshot: ShopSnapshot = {
  orders: [],
  addresses: [],
  favorites: [],
};
const clean = (v: unknown, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);
export function shopAddressInput(input: unknown): Omit<ShopAddress, "id"> {
  const v = (input as Partial<ShopAddress>) || {},
    postalCode = clean(v.postalCode, 20)
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const address = {
    label: clean(v.label, 80),
    recipient: clean(v.recipient, 120),
    city: clean(v.city, 100),
    postalCode,
    street: clean(v.street, 1000),
    country: "IR" as const,
  };
  if (
    address.recipient.length < 3 ||
    address.city.length < 2 ||
    address.street.length < 10 ||
    !/^\d{10}$/.test(postalCode)
  )
    throw Error("اطلاعات نشانی کامل نیست / Complete the address details");
  return address;
}
export function shopEnquiryInput(input: unknown) {
  const v =
      (input as {
        description?: unknown;
        quantity?: unknown;
        addressId?: unknown;
      }) || {},
    description = clean(v.description, 4000),
    quantity = Number(v.quantity);
  if (
    description.length < 10 ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  )
    throw Error(
      "شرح تجهیزات و تعداد را کامل کنید / Complete equipment details and quantity",
    );
  return { description, quantity, addressId: clean(v.addressId, 80) || null };
}
export const shopOrderStates: Record<string, readonly [string, string]> = {
  requested: ["در انتظار استعلام", "Awaiting quote"],
  quoted: ["پیشنهاد قیمت", "Price offered"],
  awaiting_payment: ["در انتظار پرداخت", "Awaiting payment"],
  paid: ["پرداخت‌شده", "Paid"],
  packing: ["در حال آماده‌سازی", "Preparing"],
  shipped: ["ارسال‌شده", "Shipped"],
  delivered: ["تحویل‌شده", "Delivered"],
  cancelled: ["لغوشده", "Cancelled"],
  returned: ["برگشت‌شده", "Returned"],
};
export function mayCancelShopOrder(status: string) {
  return status === "requested";
}
