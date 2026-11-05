import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Heart,
  Plus,
  Minus,
  Trash2,
  ArrowLeftRight,
  Check,
  Package,
  Truck,
  CreditCard,
  Wallet,
  FileText,
  UserRound,
  ShieldCheck,
  ChevronDown,
  X,
} from "lucide-react";
import SiteLayout, { DirectionArrow } from "./SiteLayout";
import { shopEnquiryDraftKey } from "@/lib/shop-enquiry-handoff";
import "./store-redesign.css";
import { useSiteCopy } from "./site-copy";
import {
  equipmentProfiles,
  equipmentCategories,
  equipmentTotals,
  equipmentCondition,
  equipmentWarranty,
  type EquipmentProfile,
} from "@/data/equipmentStore";

export function EquipmentArt({
  product,
  large = false,
}: {
  product: EquipmentProfile;
  large?: boolean;
}) {
  const category = product.category,
    wireless = category === "wireless",
    optics = category === "optics";
  return (
    <div
      className={
        "nv-equipment-art nv-device-" +
        product.color +
        (large ? " nv-equipment-large" : "")
      }
      role="img"
      aria-label={product.name[1]}
    >
      <svg viewBox="0 0 360 230" fill="none" aria-hidden="true">
        <ellipse
          cx="182"
          cy="195"
          rx="125"
          ry="15"
          fill="currentColor"
          opacity=".1"
        />
        {wireless ? (
          <>
            <ellipse cx="180" cy="115" rx="102" ry="50" fill="#cbd7e6" />
            <ellipse cx="180" cy="105" rx="102" ry="50" fill="#fff" />
            <ellipse
              cx="180"
              cy="105"
              rx="69"
              ry="34"
              stroke="#dde8f1"
              strokeWidth="2"
            />
            <path
              d="M164 109q16-17 32 0m-24 6q8-9 16 0"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="180" cy="122" r="3" fill="currentColor" />
            <path
              d="M102 52q78-54 156 0"
              stroke="currentColor"
              opacity=".15"
              strokeWidth="3"
            />{" "}
          </>
        ) : optics ? (
          <>
            <path d="m90 130 125-45 59 33-124 49-60-37Z" fill="#eef3f8" />
            <path d="m90 130 60 37v26l-60-36v-27Z" fill="#92a5be" />
            <path d="m150 167 124-49v27l-124 48v-26Z" fill="#647b9b" />
            <path d="m91 130-28 9v26l28-9v-26Z" fill="currentColor" />
            <path d="m69 146 15-5v12l-15 5v-12Z" fill="#14233d" />
            <path d="m141 116 67-24 24 13-67 26-24-15Z" fill="white" />
            <path
              d="m155 118 45-17"
              stroke="currentColor"
              strokeWidth="3"
              opacity=".6"
            />
          </>
        ) : (
          <>
            <path d="m48 90 216-30 51 44-217 34-50-48Z" fill="#f3f7fc" />
            <path d="m48 90 50 48v47l-50-47V90Z" fill="#647b9a" />
            <path d="m98 138 217-34v48L98 185v-47Z" fill="#203858" />
            {Array.from(
              {
                length:
                  category === "switch" || category === "accessories" ? 12 : 6,
              },
              (_, i) => (
                <g key={i}>
                  <path
                    d={`m${113 + i * 15} ${149 - i * 2.3} 10-1.5v13l-10 1.5v-13Z`}
                    fill="#081b30"
                    stroke="#8a9fb8"
                    strokeWidth=".7"
                  />
                  <path
                    d={`m${115 + i * 15} ${159 - i * 2.3} 6-.8`}
                    stroke={i % 3 ? "#6bbbc5" : "#ffbd61"}
                    strokeWidth="1.4"
                  />
                </g>
              ),
            )}
            <path d="m155 94 80-11" stroke="#b0c1d5" strokeWidth="2" />
            <path d="m149 104 90-13" stroke="#c6d3e3" strokeWidth="2" />
            {category === "router" && (
              <>
                <path
                  d="M95 95V32m167 45V19"
                  stroke="#243d5c"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </>
            )}
            {category === "firewall" && (
              <path
                d="m191 73 16 6v10q-2 13-16 20-14-3-16-15V81l16-8Z"
                fill="currentColor"
                opacity=".8"
              />
            )}
            <circle cx="296" cy="138" r="2.5" fill="#6ed8c1" />
          </>
        )}
      </svg>
      <span className="nv-device-orbit" />
      <span className="nv-device-label">{product.id.toUpperCase()}</span>
    </div>
  );
}
const cartKey = "rackvira.cart";
function loadCart(): { id: string; quantity: number }[] {
  try {
    const rows: unknown = JSON.parse(sessionStorage.getItem(cartKey) || "[]");
    if (!Array.isArray(rows)) return [];
    return rows.filter(
      (v) =>
        v &&
        equipmentProfiles.some((p) => p.id === v.id) &&
        Number.isInteger(v.quantity) &&
        v.quantity > 0 &&
        v.quantity <= 99,
    );
  } catch {
    return [];
  }
}
export default function EquipmentStore() {
  const navigate = useNavigate();
  const { s, text, n, money, fa } = useSiteCopy(),
    [params, setParams] = useSearchParams(),
    view = params.get("view") || "shop",
    product = equipmentProfiles.find((v) => v.id === params.get("product"));
  const [category, setCategory] = useState("all"),
    [query, setQuery] = useState(""),
    [condition, setCondition] = useState("all"),
    [priceBand, setPriceBand] = useState("all"),
    [warrantyOnly, setWarrantyOnly] = useState(false),
    [sort, setSort] = useState("featured"),
    [cart, setCart] = useState(loadCart),
    [favorites, setFavorites] = useState<string[]>([]),
    [compare, setCompare] = useState<string[]>([]),
    [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      sessionStorage.setItem(cartKey, JSON.stringify(cart));
    } catch {}
  }, [cart]);
  const totals = equipmentTotals(cart),
    count = cart.reduce((sum, v) => sum + v.quantity, 0),
    rows = equipmentProfiles
      .filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (condition === "all" || (p.condition || "new") === condition) &&
          (!warrantyOnly || !!p.warranty?.available) &&
          (priceBand === "all" ||
            (priceBand === "budget"
              ? p.price < 5000000
              : priceBand === "mid"
                ? p.price >= 5000000 && p.price <= 15000000
                : p.price > 15000000)) &&
          (text(p.name) + " " + p.id)
            .toLowerCase()
            .includes(query.toLowerCase()),
      )
      .sort((a, b) =>
        sort === "low"
          ? a.price - b.price
          : sort === "high"
            ? b.price - a.price
            : 0,
      );
  const go = (next: string, id?: string) => {
    setNotice("");
    setParams(
      next === "shop" ? {} : { view: next, ...(id ? { product: id } : {}) },
    );
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const add = (id: string) => {
    setCart((v) => {
      const exists = v.find((i) => i.id === id);
      return exists
        ? v.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i,
          )
        : [...v, { id, quantity: 1 }];
    });
    setNotice(s("به سبد نمایشی اضافه شد.", "Added to the preview cart."));
  };
  const toggle = (
    id: string,
    list: string[],
    set: (v: string[]) => void,
    max = 99,
  ) => {
    if (list.includes(id)) set(list.filter((v) => v !== id));
    else if (list.length < max) set([...list, id]);
    else
      setNotice(
        s(
          "برای مقایسه حداکثر سه محصول انتخاب کنید.",
          "Compare up to three products.",
        ),
      );
  };
  const labels = equipmentCategories.filter((c) => c.id !== "all");
  if (view === "invoice" || view === "account-preview")
    return (
      <Navigate
        replace
        to={view === "invoice" ? "/account?section=invoices" : "/account"}
      />
    );
  const requestProforma = () => {
    try {
      sessionStorage.setItem(
        shopEnquiryDraftKey,
        JSON.stringify({ at: Date.now(), lines: cart }),
      );
    } catch {}
    navigate("/account?section=enquiry");
  };
  return (
    <SiteLayout title={s("فروشگاه تجهیزات شبکه", "Network equipment shop")}>
      <div className="nv-shop-shell">
        <div className="nv-shop-preview-note">
          <span>{s("پیش‌نمایش فروشگاه", "SHOP PREVIEW")}</span>
          {s(
            "محصولات، قیمت و موجودی نمونه‌اند؛ خرید واقعی فعال نیست.",
            "Products, prices and availability are examples. Live purchasing is not enabled.",
          )}
        </div>
        <div className="nv-container nv-shop-toolbar">
          <button
            type="button"
            className="nv-shop-brand"
            onClick={() => go("shop")}
          >
            <img src="/rackvira.svg" alt="" width="36" height="36" />
            <span>
              <strong>{s("تجهیزات شبکه", "NETWORK GEAR")}</strong>
              <small>RACKVIRA / NETWORK</small>
            </span>
          </button>
          {view === "shop" && (
            <form
              className="nv-shop-search"
              onSubmit={(e) => {
                e.preventDefault();
                document
                  .getElementById("nv-equipment-catalog")
                  ?.scrollIntoView({
                    behavior: matchMedia("(prefers-reduced-motion: reduce)")
                      .matches
                      ? "instant"
                      : "smooth",
                  });
              }}
            >
              <div className="nv-search">
                <Search size={19} />
                <input
                  aria-label={s("جستجوی تجهیزات", "Search equipment")}
                  placeholder={s(
                    "روتر، سوئیچ، اکسس‌پوینت…",
                    "Router, switch, access point…",
                  )}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                aria-label={s("نمایش نتایج جستجو", "Show search results")}
              >
                <Search size={21} />
              </button>
            </form>
          )}
          <div className="nv-shop-toolbar-actions">
            <Link className="nv-shop-account-link" to="/account">
              <UserRound size={20} />
              <span>{s("حساب فروشگاه", "Shop account")}</span>
            </Link>
            <button type="button" onClick={() => go("compare")}>
              <ArrowLeftRight size={18} />
              {s("مقایسه", "Compare")} <b>{n(compare.length)}</b>
            </button>
            <button
              type="button"
              className="nv-shop-cart-button"
              onClick={() => {
                go("checkout");
              }}
            >
              <ShoppingCart size={19} />
              {s("سبد استعلام", "Quote basket")}
              <b>{n(count)}</b>
            </button>
          </div>
        </div>
        {view === "shop" ? (
          <>
            <section className="nv-container nv-retail-showcase">
              <div className="nv-retail-feature">
                <div className="nv-retail-feature-copy">
                  <span>
                    {s(
                      "تجهیزات شبکه، یک انتخاب تخصصی",
                      "THE NETWORK EQUIPMENT STORE",
                    )}
                  </span>
                  <h1>
                    {s("شبکه را حرفه‌ای بسازید.", "Build a better network.")}
                  </h1>
                  <p>
                    {s(
                      "روتر، سوئیچ، امنیت و ارتباطات بی‌سیم؛ تجهیزات نو و استوک را بررسی و مقایسه کنید.",
                      "Routing, switching, security and wireless. Explore and compare new and pre-owned equipment.",
                    )}
                  </p>
                  <a href="#nv-equipment-catalog" className="nv-button">
                    {s("مشاهده تجهیزات", "Shop equipment")}
                    <DirectionArrow />
                  </a>
                </div>
                <img
                  className="nv-store-studio"
                  src="/art/network-equipment-studio.webp"
                  width="1536"
                  height="1024"
                  alt={s(
                    "تصویر مفهومی تجهیزات شبکه؛ محصول واقعی نیست",
                    "Conceptual network equipment; not actual product photography",
                  )}
                />
                <small>
                  {s("تصویر مفهومی تجهیزات", "CONCEPT EQUIPMENT VISUAL")}
                </small>
              </div>
              <div className="nv-retail-sidepromos">
                <button
                  type="button"
                  className="nv-retail-used-promo"
                  onClick={() => {
                    setCondition("used");
                    setWarrantyOnly(true);
                    setCategory("all");
                    setQuery("");
                    setPriceBand("all");
                    document
                      .getElementById("nv-equipment-catalog")
                      ?.scrollIntoView({
                        behavior: matchMedia("(prefers-reduced-motion: reduce)")
                          .matches
                          ? "instant"
                          : "smooth",
                      });
                  }}
                >
                  <div>
                    <span>
                      {s(
                        "استوک با گزینه گارانتی",
                        "PRE-OWNED / WARRANTY OPTIONS",
                      )}
                    </span>
                    <h2>
                      {s(
                        "انتخاب اقتصادی، بررسی تخصصی",
                        "A smarter second life",
                      )}
                    </h2>
                    <p>
                      {s(
                        "گرید، تست سلامت و شرایط گارانتی، پیش از خرید تأیید می‌شوند.",
                        "Grade, testing and warranty terms require verification before purchase.",
                      )}
                    </p>
                    <b>
                      {s("دیدن تجهیزات استوک", "Explore pre-owned gear")}
                      <DirectionArrow size={17} />
                    </b>
                  </div>
                  <EquipmentArt
                    product={
                      equipmentProfiles.find((p) => p.id === "core-24-stock")!
                    }
                  />
                </button>
                <Link
                  className="nv-retail-business-promo"
                  to="/account?section=invoices"
                >
                  <span>
                    <FileText size={29} />
                  </span>
                  <div>
                    <h2>
                      {s(
                        "خرید سازمانی، فاکتور منظم",
                        "Equipment for your business",
                      )}
                    </h2>
                    <p>
                      {s(
                        "پیش‌فاکتور و فاکتور با مشخصات حقوقی ثبت‌شده حساب",
                        "Proformas and invoices with your registered company details",
                      )}
                    </p>
                  </div>
                  <DirectionArrow size={20} />
                </Link>
              </div>
            </section>
            <section className="nv-container nv-store-benefits">
              {[
                [
                  Package,
                  s(
                    "دسته‌بندی تخصصی تجهیزات",
                    "Specialist equipment categories",
                  ),
                ],
                [
                  ArrowLeftRight,
                  s("مقایسه قبل از انتخاب", "Compare before choosing"),
                ],
                [
                  ShieldCheck,
                  s("استعلام قیمت و سازگاری", "Price & compatibility review"),
                ],
                [
                  Truck,
                  s(
                    "ارسال پس از تأیید سفارش",
                    "Delivery after order confirmation",
                  ),
                ],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Package;
                return (
                  <div key={String(label)}>
                    <I size={22} />
                    {String(label)}
                  </div>
                );
              })}
            </section>
            <section
              className="nv-container nv-store-catalog"
              id="nv-equipment-catalog"
            >
              <div className="nv-shop-section-heading">
                <div>
                  <span className="nv-eyebrow">
                    {s(
                      "تجهیزات را بر اساس نیاز پیدا کنید",
                      "FIND YOUR NEXT PIECE",
                    )}
                  </span>
                  <h2>
                    {s(
                      "یک شبکه، انتخاب‌های دقیق.",
                      "A network built with the right pieces.",
                    )}
                  </h2>
                </div>
                <span>
                  {n(rows.length)} {s("پروفایل نمایشی", "example profiles")}
                </span>
              </div>
              <div
                className="nv-equipment-categories"
                role="group"
                aria-label={s("دسته تجهیزات", "Equipment category")}
              >
                {equipmentCategories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    aria-pressed={category === c.id}
                    aria-label={text(c.title)}
                    data-category={c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.id === "all" ? (
                      <span className="nv-all-equipment">
                        <Package size={36} />
                      </span>
                    ) : (
                      <EquipmentArt
                        product={
                          equipmentProfiles.find((p) => p.category === c.id)!
                        }
                      />
                    )}
                    <span>{text(c.title)}</span>
                  </button>
                ))}
              </div>
              <div className="nv-retail-catalog-layout">
                <aside className="nv-retail-filter-panel">
                  <div className="nv-retail-filter-title">
                    <SlidersHorizontal size={21} />
                    <h3>{s("فیلتر تجهیزات", "Refine your selection")}</h3>
                  </div>
                  <div className="nv-stock-filters">
                    <div
                      role="group"
                      aria-label={s("وضعیت کالا", "Equipment condition")}
                    >
                      {[
                        ["all", s("همه وضعیت‌ها", "All conditions")],
                        ["new", s("نو", "New")],
                        ["used", s("استوک", "Pre-owned")],
                      ].map(([id, title]) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={condition === id}
                          onClick={() => setCondition(id)}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                    <label>
                      <input
                        type="checkbox"
                        checked={warrantyOnly}
                        onChange={(e) => setWarrantyOnly(e.target.checked)}
                      />
                      {s("دارای گزینه گارانتی", "Warranty option available")}
                    </label>
                  </div>
                  <label className="nv-retail-price-filter">
                    {s(
                      "بازه قیمت نمونه (تومان)",
                      "Example price range (Toman)",
                    )}
                    <select
                      value={priceBand}
                      onChange={(e) => setPriceBand(e.target.value)}
                    >
                      <option value="all">
                        {s("همه قیمت‌ها", "Any price")}
                      </option>
                      <option value="budget">
                        {s("کمتر از ۵ میلیون", "Under 5 million")}
                      </option>
                      <option value="mid">
                        {s("۵ تا ۱۵ میلیون", "5 to 15 million")}
                      </option>
                      <option value="pro">
                        {s("بیشتر از ۱۵ میلیون", "Over 15 million")}
                      </option>
                    </select>
                  </label>
                  <button
                    type="button"
                    className="nv-text-link"
                    onClick={() => {
                      setCategory("all");
                      setCondition("all");
                      setWarrantyOnly(false);
                      setQuery("");
                      setPriceBand("all");
                    }}
                  >
                    {s("پاک کردن فیلترها", "Clear all filters")}
                  </button>
                  <p className="nv-retail-filter-note">
                    {s(
                      "تمام اقلام این کاتالوگ فعلاً پروفایل مرجع هستند. قیمت و موجودی واقعی پیش از فروش تأیید می‌شود.",
                      "These are reference catalog profiles. Actual pricing and availability require verification before sale.",
                    )}
                  </p>
                </aside>
                <div className="nv-retail-results">
                  <div className="nv-store-search-row">
                    <span className="nv-catalog-result-count">
                      {n(rows.length)}{" "}
                      {s("پروفایل در این دسته", "profiles in this selection")}
                    </span>
                    <label>
                      {s("مرتب‌سازی", "Sort")}
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        aria-label={s("مرتب‌سازی تجهیزات", "Sort equipment")}
                      >
                        <option value="featured">
                          {s("پیشنهادی", "Featured")}
                        </option>
                        <option value="low">
                          {s(
                            "قیمت نمونه: کم به زیاد",
                            "Example price: low to high",
                          )}
                        </option>
                        <option value="high">
                          {s(
                            "قیمت نمونه: زیاد به کم",
                            "Example price: high to low",
                          )}
                        </option>
                      </select>
                    </label>
                  </div>
                  <div className="nv-equipment-grid">
                    {rows.map((p) => (
                      <article className="nv-equipment-card" key={p.id}>
                        <button
                          type="button"
                          className="nv-favorite"
                          aria-pressed={favorites.includes(p.id)}
                          aria-label={
                            s("علاقه‌مندی: ", "Save: ") + text(p.name)
                          }
                          onClick={() => toggle(p.id, favorites, setFavorites)}
                        >
                          <Heart
                            size={18}
                            fill={
                              favorites.includes(p.id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                        <span className="nv-product-reference-label">
                          {s("پروفایل نمونه", "REFERENCE PROFILE")}
                        </span>
                        <button
                          type="button"
                          className="nv-product-art-button"
                          aria-label={s("جزئیات: ", "Details: ") + text(p.name)}
                          onClick={() => go("product", p.id)}
                        >
                          <EquipmentArt product={p} />
                        </button>
                        <div className="nv-equipment-body">
                          <div className="nv-condition-badges">
                            <span data-condition={p.condition || "new"}>
                              {equipmentCondition(p, fa)}
                            </span>
                            {p.warranty?.available && (
                              <span>
                                {s("گزینه گارانتی", "Warranty option")}
                              </span>
                            )}
                          </div>
                          <span className="nv-product-category">
                            {text(
                              labels.find((c) => c.id === p.category)!.title,
                            )}
                          </span>
                          <button
                            type="button"
                            className="nv-equipment-title"
                            onClick={() => go("product", p.id)}
                          >
                            {text(p.name)}
                          </button>
                          <ul>
                            {p.specs.map((spec) => (
                              <li key={spec[1]}>
                                <Check size={13} />
                                {text(spec)}
                              </li>
                            ))}
                          </ul>
                          <p className="nv-warranty-line">
                            <ShieldCheck size={16} />
                            {n(equipmentWarranty(p, fa))}
                          </p>
                          <span className="nv-example-price">
                            {s("قیمت نمونه", "Example price")}
                          </span>
                          <strong className="nv-equipment-price">
                            {money(p.price)}
                          </strong>
                          <div className="nv-equipment-actions">
                            <button
                              type="button"
                              className="nv-button"
                              onClick={() => add(p.id)}
                            >
                              <Plus size={17} />
                              {s("سبد نمایشی", "Preview cart")}
                            </button>
                            <button
                              type="button"
                              className="nv-compare-toggle"
                              aria-label={
                                s("مقایسه: ", "Compare: ") + text(p.name)
                              }
                              aria-pressed={compare.includes(p.id)}
                              onClick={() =>
                                toggle(p.id, compare, setCompare, 3)
                              }
                            >
                              <ArrowLeftRight size={19} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  {!rows.length && (
                    <p className="nv-empty">
                      {s("محصولی پیدا نشد.", "No products found.")}
                    </p>
                  )}
                </div>
              </div>
            </section>
            <section className="nv-container rv-campaign">
              <a href="#nv-equipment-catalog">
                <img
                  src="/rackvira.svg"
                  alt=""
                  width="72"
                  height="72"
                  loading="lazy"
                />
                <span>
                  <strong>
                    {s(
                      "شبکه‌ات را یک رده بالاتر ببر",
                      "Take your network up a rack",
                    )}
                  </strong>
                  <small>
                    {s(
                      "تجهیزات نو و استوک را کنار هم مقایسه کنید.",
                      "Compare new and refurbished equipment side by side.",
                    )}
                  </small>
                </span>
                <DirectionArrow size={25} />
              </a>
            </section>
            <section className="nv-container nv-store-consult">
              <div>
                <h2>
                  {s(
                    "تجهیزات و تنظیمات، کنار هم.",
                    "Your equipment. Configured to fit.",
                  )}
                </h2>
                <p>
                  {s(
                    "اگر برای انتخاب یا تنظیم شبکه به راهنمایی نیاز دارید، نیازتان را با تیم خدمات شبکه در میان بگذارید.",
                    "Need help choosing or configuring your network? Discuss your needs with the network services team.",
                  )}
                </p>
              </div>
              <Link
                to="/account?section=enquiry"
                className="nv-button nv-button-outline"
              >
                {s("خدمات شبکه از راه دور", "Remote network services")}
                <DirectionArrow />
              </Link>
            </section>
          </>
        ) : view === "product" && product ? (
          <section className="nv-container nv-product-detail">
            <button
              type="button"
              className="nv-back-button"
              onClick={() => go("shop")}
            >
              {fa ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}{" "}
              {s("بازگشت به فروشگاه", "Back to shop")}
            </button>
            <div className="nv-product-detail-grid">
              <EquipmentArt product={product} large />
              <div>
                <span className="nv-eyebrow">
                  {text(labels.find((c) => c.id === product.category)!.title)}
                </span>
                <h1>{text(product.name)}</h1>
                <div className="nv-product-warranty">
                  <strong>{equipmentCondition(product, fa)}</strong>
                  <p>
                    <ShieldCheck size={20} />
                    {n(equipmentWarranty(product, fa))}
                  </p>
                  {product.condition === "used" && (
                    <p>
                      {s(
                        "گرید ظاهری، تست فنی، سریال، لوازم همراه و شرایط مرجوعی در انتظار تأیید هستند.",
                        "Cosmetic grade, testing, serial number, accessories and return terms are pending confirmation.",
                      )}
                    </p>
                  )}
                </div>
                <p>{text(product.description)}</p>
                <ul>
                  {product.specs.map((v) => (
                    <li key={v[1]}>
                      <Check size={17} />
                      {text(v)}
                    </li>
                  ))}
                </ul>
                <small>
                  {s(
                    "پروفایل نمایشی · موجودی تأییدنشده",
                    "Example profile · inventory unverified",
                  )}
                </small>
                <span className="nv-example-price">
                  {s("قیمت نمونه، پیش از مالیات", "Example price before tax")}
                </span>
                <strong className="nv-detail-price">
                  {money(product.price)}
                </strong>
                <div className="nv-button-row">
                  <button
                    type="button"
                    className="nv-button"
                    onClick={() => add(product.id)}
                  >
                    <ShoppingCart size={18} />
                    {s("افزودن به سبد نمایشی", "Add to preview cart")}
                  </button>
                  <button
                    type="button"
                    className="nv-button nv-button-outline"
                    onClick={() => {
                      go("checkout");
                    }}
                  >
                    {s("دیدن سبد خرید", "View cart")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : view === "compare" ? (
          <section className="nv-container nv-shop-compare">
            <h1>{s("مقایسه تجهیزات", "Compare equipment")}</h1>
            <button
              type="button"
              className="nv-text-link"
              onClick={() => go("shop")}
            >
              {s("بازگشت به تجهیزات", "Back to equipment")}
              <DirectionArrow />
            </button>
            {compare.length ? (
              <div className="nv-compare-grid">
                {compare.map((id) => {
                  const p = equipmentProfiles.find((v) => v.id === id)!;
                  return (
                    <article key={id}>
                      <EquipmentArt product={p} />
                      <h2>{text(p.name)}</h2>
                      {p.specs.map((v) => (
                        <p key={v[1]}>{text(v)}</p>
                      ))}
                      <strong>{money(p.price)}</strong>
                      <button
                        type="button"
                        className="nv-button"
                        onClick={() => add(id)}
                      >
                        {s("افزودن به سبد نمایشی", "Add to preview cart")}
                      </button>
                      <button
                        type="button"
                        className="nv-text-link"
                        onClick={() =>
                          setCompare(compare.filter((v) => v !== id))
                        }
                      >
                        {s("حذف از مقایسه", "Remove from comparison")}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="nv-choice-empty">
                <ArrowLeftRight size={40} />
                <p>
                  {s(
                    "از فهرست، دو یا سه محصول را برای مقایسه انتخاب کنید.",
                    "Select two or three products from the catalog to compare.",
                  )}
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="nv-container nv-equipment-checkout">
            <button
              type="button"
              className="nv-back-button"
              onClick={() => go("shop")}
            >
              <DirectionArrow size={18} />
              {s("بازگشت به فروشگاه", "Back to shop")}
            </button>
            <div className="nv-shop-section-heading">
              <div>
                <h1>{s("سبد استعلام تجهیزات", "Equipment quote basket")}</h1>
                <p>
                  {s(
                    "قیمت‌های این سبد برآوردند. پس از ورود، درخواست را برای بررسی موجودی و قیمت ثبت کنید.",
                    "These are estimates. Sign in to request confirmed availability and pricing.",
                  )}
                </p>
              </div>
            </div>
            {cart.length ? (
              <div className="rv-basket">
                {cart.map((row) => {
                  const p = equipmentProfiles.find((p) => p.id === row.id)!;
                  return (
                    <div key={row.id} className="rv-basket-row">
                      <strong>{text(p.name)}</strong>
                      <span>{money(p.price * row.quantity)}</span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={row.quantity}
                        aria-label={s("تعداد", "Quantity")}
                        onChange={(e) => {
                          const quantity = Math.max(
                            1,
                            Math.min(99, Math.trunc(Number(e.target.value))),
                          );
                          setCart(
                            cart.map((v) =>
                              v.id === row.id ? { ...v, quantity } : v,
                            ),
                          );
                        }}
                      />
                      <button
                        type="button"
                        className="nv-back-button"
                        aria-label={s("حذف کالا", "Remove item")}
                        onClick={() =>
                          setCart(cart.filter((v) => v.id !== row.id))
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
                <p>
                  {s("جمع برآورد با مالیات", "Estimated total with tax")}{" "}
                  <strong>{money(totals.total)}</strong>
                </p>
                <button
                  type="button"
                  className="nv-button"
                  onClick={requestProforma}
                >
                  {s("ادامه و ثبت استعلام", "Continue to enquiry")}
                  <DirectionArrow size={17} />
                </button>
              </div>
            ) : (
              <p className="nv-empty">
                {s("سبد استعلام خالی است.", "Your quote basket is empty.")}
              </p>
            )}
          </section>
        )}
        {notice && (
          <div className="nv-shop-notice" role="status">
            <Check size={19} />
            <span>{notice}</span>
            <button
              type="button"
              aria-label={s("بستن پیام", "Dismiss message")}
              onClick={() => setNotice("")}
            >
              <X size={17} />
            </button>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
function NetworkDots() {
  return (
    <span className="nv-network-dots">
      <i />
      <i />
      <i />
    </span>
  );
}
