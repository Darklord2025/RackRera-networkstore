export type ShopCategory =
  | "router"
  | "switch"
  | "wireless"
  | "firewall"
  | "optics"
  | "accessories";
export interface EquipmentProfile {
  id: string;
  name: readonly [string, string];
  category: ShopCategory;
  price: number;
  specs: readonly (readonly [string, string])[];
  description: readonly [string, string];
  color: string;
  condition?: "new" | "used" | "refurbished";
  grade?: "A" | "B" | "ungraded";
  warranty?: {
    available: boolean;
    verified: boolean;
    months: number | null;
    provider: string | null;
  };
}
// Design-only merchandising data. These are illustrative profiles, never real stock or supplier offers.
export const equipmentProfiles: EquipmentProfile[] = [
  {
    id: "edge-8",
    name: ["روتر شعبه Edge 8", "Edge 8 branch router"],
    category: "router",
    price: 8400000,
    color: "blue",
    specs: [
      ["۸ پورت شبکه", "8 network ports"],
      ["پروفایل مسیریابی شعبه", "Branch routing profile"],
    ],
    description: [
      "برای اتصال دفتر و شعبه؛ مشخصات، برند و مدل واقعی پس از انتخاب تأمین‌کننده جایگزین می‌شود.",
      "A branch-office routing concept. Real brand, model and specifications will replace this profile after supplier selection.",
    ],
  },
  {
    id: "core-24",
    name: ["سوئیچ مدیریتی Core 24", "Core 24 managed switch"],
    category: "switch",
    price: 14600000,
    color: "violet",
    specs: [
      ["۲۴ پورت شبکه", "24 network ports"],
      ["پروفایل سوئیچ مدیریتی", "Managed switching profile"],
    ],
    description: [
      "نمونه چیدمان محصول برای شبکه اداری و تفکیک VLAN؛ سازگاری و امکانات به مدل واقعی وابسته است.",
      "An office-network merchandising profile. VLAN features and compatibility depend on the actual model.",
    ],
  },
  {
    id: "air-6",
    name: ["اکسس‌پوینت Air 6", "Air 6 access point"],
    category: "wireless",
    price: 6700000,
    color: "teal",
    specs: [
      ["پروفایل شبکه بی‌سیم", "Wireless networking profile"],
      ["نصب سقفی یا دیواری", "Ceiling or wall mounting concept"],
    ],
    description: [
      "نمونه محصول برای پوشش بی‌سیم دفتر؛ بررسی محل، تعداد کاربران و مدل لازم است.",
      "A wireless coverage concept. Site conditions, client count and the actual model need review.",
    ],
  },
  {
    id: "guard-s",
    name: ["فایروال دفتر Guard S", "Guard S office firewall"],
    category: "firewall",
    price: 21800000,
    color: "orange",
    specs: [
      ["پروفایل امنیت شبکه", "Network security profile"],
      ["لایسنس نیازمند استعلام", "License requires a supplier quote"],
    ],
    description: [
      "نمونه تجهیزات امنیتی برای نمایش فروشگاه؛ ظرفیت، قابلیت VPN و لایسنس هنوز تأیید نشده‌اند.",
      "A security appliance display profile. Capacity, VPN features and licensing are unverified.",
    ],
  },
  {
    id: "link-10",
    name: ["ماژول فیبر Link 10", "Link 10 optical module"],
    category: "optics",
    price: 1850000,
    color: "cyan",
    specs: [
      ["پروفایل ماژول نوری", "Optical module profile"],
      [
        "تطبیق با دستگاه قبل از خرید",
        "Device compatibility checked before purchase",
      ],
    ],
    description: [
      "نمایش نمونه محصول نوری؛ نوع کانکتور، طول موج و سازگاری باید از تأمین‌کننده تأیید شود.",
      "An optical product concept. Connector, wavelength and compatibility require supplier confirmation.",
    ],
  },
  {
    id: "patch-24",
    name: ["پچ‌پنل Patch 24", "Patch 24 patch panel"],
    category: "accessories",
    price: 1350000,
    color: "rose",
    specs: [
      ["۲۴ مسیر اتصال", "24 connection points"],
      ["پروفایل لوازم رک", "Rack accessory profile"],
    ],
    description: [
      "نمونه لوازم جانبی برای نمایش دسته‌بندی تجهیزات؛ جنس، استاندارد و مدل واقعی هنوز تعیین نشده است.",
      "A rack accessory display profile. Material, standard and actual model are not yet specified.",
    ],
  },
  {
    id: "edge-pro",
    name: ["روتر مرکزی Edge Pro", "Edge Pro gateway router"],
    category: "router",
    price: 17300000,
    color: "blue",
    specs: [
      ["پروفایل دروازه شبکه", "Network gateway profile"],
      ["بررسی ظرفیت موردنیاز", "Capacity assessment required"],
    ],
    description: [
      "برای نمایش یک گزینه رده بالاتر در مقایسه محصولات؛ ارقام عملکردی به مدل واقعی وابسته‌اند.",
      "A higher-tier comparison concept. Performance figures depend on the actual device.",
    ],
  },
  {
    id: "poe-8",
    name: ["سوئیچ PoE هشت پورت", "8-port PoE switch"],
    category: "switch",
    price: 9200000,
    color: "violet",
    specs: [
      ["۸ پورت در پروفایل نمونه", "8 ports in the example profile"],
      ["بودجه PoE نیازمند تأیید", "PoE power budget requires confirmation"],
    ],
    description: [
      "نمونه محصول برای اتصال اکسس‌پوینت و دوربین؛ توان، استاندارد و سازگاری باید جداگانه تأیید شوند.",
      "A concept for access-point and camera networks. Power, standards and compatibility need separate verification.",
    ],
  },
];
// Reference stock-equipment profiles. No serial, grading, stock or warranty has been verified.
equipmentProfiles.push(
  {
    ...equipmentProfiles[1],
    id: "core-24-stock",
    name: ["سوئیچ مدیریتی Core 24 استوک", "Core 24 pre-owned switch"],
    condition: "used",
    grade: "ungraded",
    warranty: {
      available: true,
      verified: false,
      months: null,
      provider: null,
    },
    description: [
      "نمونه تجهیزات استوک با امکان گارانتی؛ وضعیت ظاهری، تست فنی، سریال و شرایط ضمانت پیش از خرید باید تأیید شوند.",
      "A pre-owned equipment example with a warranty option. Cosmetic grade, testing, serial number and coverage must be verified before purchase.",
    ],
  },
  {
    ...equipmentProfiles[0],
    id: "edge-8-stock",
    name: ["روتر شعبه Edge 8 استوک", "Edge 8 pre-owned router"],
    condition: "used",
    grade: "ungraded",
    warranty: {
      available: true,
      verified: false,
      months: null,
      provider: null,
    },
    description: [
      "پروفایل مرجع روتر استوک؛ مدت و شرکت گارانتی، لوازم همراه، سلامت و موجودی واقعی هنوز تأیید نشده‌اند.",
      "A reference pre-owned router. Warranty duration/provider, accessories, test results and actual stock are unverified.",
    ],
  },
);

export function equipmentCondition(product: EquipmentProfile, fa: boolean) {
  return product.condition === "used"
    ? fa
      ? "استوک"
      : "Pre-owned"
    : product.condition === "refurbished"
      ? fa
        ? "بازسازی‌شده"
        : "Refurbished"
      : fa
        ? "نو"
        : "New";
}

export function equipmentWarranty(product: EquipmentProfile, fa: boolean) {
  const w = product.warranty;
  if (w?.verified && w.provider && w.months && w.months > 0)
    return `${w.months} ${fa ? "ماه" : "months"} · ${w.provider}`;
  return w?.available
    ? fa
      ? "گزینه گارانتی؛ مدت و شرکت در انتظار تأیید"
      : "Warranty option; duration and provider pending"
    : fa
      ? "شرایط گارانتی نیازمند استعلام"
      : "Warranty terms require a quote";
}

export const equipmentCategories = [
  { id: "all", title: ["همه تجهیزات", "All equipment"] },
  { id: "router", title: ["روتر", "Routers"] },
  { id: "switch", title: ["سوئیچ", "Switches"] },
  { id: "wireless", title: ["شبکه بی‌سیم", "Wireless"] },
  { id: "firewall", title: ["فایروال", "Firewalls"] },
  { id: "optics", title: ["فیبر و ماژول", "Optics & modules"] },
  { id: "accessories", title: ["رک و لوازم جانبی", "Rack & accessories"] },
] as const;
export function equipmentTotals(lines: { id: string; quantity: number }[]) {
  let subtotal = 0;
  for (const line of lines) {
    const product = equipmentProfiles.find((p) => p.id === line.id);
    if (
      !product ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 99
    )
      throw Error("Invalid equipment cart");
    subtotal += product.price * line.quantity;
  }
  const tax = Math.round(subtotal * 0.1);
  return { subtotal, tax, total: subtotal + tax };
}
