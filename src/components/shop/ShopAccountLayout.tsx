import { useState } from "react";
import {
  equipmentEnquiryDraft,
  shopEnquiryDraftKey,
} from "@/lib/shop-enquiry-handoff";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  MapPin,
  Heart,
  Plus,
  Trash2,
  LogOut,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  ClipboardList,
  Check,
  RefreshCw,
  Home,
  ChevronDown,
  UserRound,
  FileText,
} from "lucide-react";
import ShopInvoices from "./ShopInvoices";
import BrandLogo from "@/components/BrandLogo";
import LanguageControl from "@/components/LanguageControl";
import { usePanelData } from "@/contexts/PanelDataContext";
import AccountProfileForm from "./AccountProfileForm";
import { usePanelCopy } from "@/components/user-panel/PanelPrimitives";
import { useTheme } from "@/contexts/ThemeContext";
import { useShopAccount } from "@/hooks/useShopAccount";
import {
  shopOrderStates,
  mayCancelShopOrder,
  type ShopAddress,
} from "../../../supabase/functions/_shared/shop-model";
import "../public/public-site.css";
import "../public/catalog-experience.css";
import "../public/public-dark.css";
import "./shop-account.css";

export default function ShopAccountLayout({
  preview = false,
}: {
  preview?: boolean;
}) {
  const panel = usePanelData(),
    shop = useShopAccount(preview),
    { s, fa, n, money } = usePanelCopy(),
    theme = useTheme(),
    navigate = useNavigate(),
    [params, setParams] = useSearchParams();
  const [localTab, setLocalTab] = useState(
      params.get("section") === "enquiry" ? "enquiry" : "overview",
    ),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [address, setAddress] = useState<Partial<ShopAddress> | null>(null),
    [description, setDescription] = useState(() => {
      try {
        return equipmentEnquiryDraft(
          sessionStorage.getItem(shopEnquiryDraftKey),
          fa,
        );
      } catch {
        return "";
      }
    }),
    [quantity, setQuantity] = useState(1),
    [addressId, setAddressId] = useState("");
  const allowed = [
      "overview",
      "orders",
      "invoices",
      "enquiry",
      "addresses",
      "favorites",
      "profile",
    ],
    tab = preview
      ? localTab
      : allowed.includes(params.get("section") || "")
        ? params.get("section")!
        : "overview";
  const choose = (next: string) => {
    setMessage("");
    if (preview) setLocalTab(next);
    else setParams(next === "overview" ? {} : { section: next });
  };
  const name = panel.data.profile.name || s("حساب شما", "Your account");
  const nav = [
    ["overview", Home, s("نمای کلی", "Overview")],
    ["orders", Package, s("سفارش‌های تجهیزات", "Equipment orders")],
    [
      "invoices",
      FileText,
      s("فاکتورها و پیش‌فاکتورها", "Invoices & proformas"),
    ],
    ["enquiry", ClipboardList, s("درخواست تأمین تجهیزات", "Equipment enquiry")],
    ["addresses", MapPin, s("نشانی‌های من", "My addresses")],
    ["favorites", Heart, s("علاقه‌مندی‌ها", "Saved items")],
    ["profile", UserRound, s("مشخصات صورتحساب", "Billing profile")],
  ] as const;
  async function perform(
    action: string,
    payload: Record<string, unknown>,
    done?: () => void,
  ) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await shop.action(action, payload);
      setMessage(
        preview
          ? s(
              "تغییر فقط در پیش‌نمایش انجام شد.",
              "Changed in the preview only.",
            )
          : s("در حساب فروشگاه ثبت شد.", "Saved in your shop account."),
      );
      done?.();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    if (busy) return;
    setBusy(true);
    try {
      if (!preview) {
        const { supabase } = await import("@/integrations/supabase/client");
        const { error } = await supabase!.auth.signOut();
        if (error) throw error;
      }
      navigate("/auth", { replace: true });
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const orders = shop.data.orders;
  const orderRows = () =>
    orders.map((order) => (
      <details className="nv-shop-order" key={order.id}>
        <summary>
          <span className="nv-shop-order-icon">
            <Package size={22} />
          </span>
          <span>
            <strong>
              {s("درخواست / سفارش ", "Request / order ")}
              {n(order.number)}
            </strong>
            <small>
              {new Date(order.createdAt).toLocaleDateString(
                fa ? "fa-IR" : "en-US",
              )}
            </small>
          </span>
          <span className={"nv-shop-order-status nv-status-" + order.status}>
            {s(
              ...((shopOrderStates[order.status] || [
                order.status,
                order.status,
              ]) as [string, string]),
            )}
          </span>
          <ChevronDown size={17} />
        </summary>
        <div className="nv-shop-order-body">
          <p>{order.description}</p>
          <dl>
            <div>
              <dt>{s("تعداد", "Quantity")}</dt>
              <dd>{n(order.quantity)}</dd>
            </div>
            <div>
              <dt>{s("مبلغ تأییدشده", "Confirmed amount")}</dt>
              <dd>
                {order.totalToman === null
                  ? s("پس از استعلام", "Awaiting quote")
                  : money(order.totalToman)}
              </dd>
            </div>
            {order.tracking && (
              <div>
                <dt>{s("کد پیگیری ارسال", "Shipment reference")}</dt>
                <dd>
                  <bdi>{order.tracking}</bdi>
                </dd>
              </div>
            )}
          </dl>
          {order.address && (
            <p className="nv-shop-order-address">
              <MapPin size={16} />
              {order.address.city} · {order.address.street}
            </p>
          )}
          <div className="nv-button-row">
            {mayCancelShopOrder(order.status) && (
              <button
                type="button"
                className="nv-shop-cancel"
                disabled={busy}
                onClick={() => void perform("enquiry-cancel", { id: order.id })}
              >
                {s("لغو درخواست استعلام", "Cancel enquiry")}
              </button>
            )}
          </div>
        </div>
      </details>
    ));
  const empty = (title: string, body: string) => (
    <div className="nv-shop-account-empty">
      <Package size={44} />
      <h3>{title}</h3>
      <p>{body}</p>
      <Link to="/" className="nv-button">
        {s("رفتن به فروشگاه", "Browse the shop")}
        {fa ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
      </Link>
    </div>
  );
  return (
    <div className="nv-site nv-shop-account" dir={fa ? "rtl" : "ltr"}>
      {preview && (
        <div className="nv-shop-account-preview">
          {s(
            "پیش‌نمایش پنل فروشگاه · اطلاعات نمونه، بدون ثبت در حساب واقعی",
            "Shop account preview · example data, no changes to a real account",
          )}
          <Link to="/account">
            {s("ورود به پنل واقعی", "Open your real account")}
          </Link>
        </div>
      )}
      <header className="nv-shop-account-header">
        <Link to="/" className="nv-shop-account-logo">
          <BrandLogo />
          <span>{s("فروشگاه تجهیزات", "EQUIPMENT STORE")}</span>
        </Link>
        <div>
          <Link to="/" className="nv-shop-account-browse">
            <ShoppingBag size={17} />
            {s("فروشگاه", "Shop")}
          </Link>
          <button
            type="button"
            className="nv-shop-header-signout"
            disabled={busy}
            onClick={() => void signOut()}
            aria-label={s("خروج از حساب", "Sign out")}
          >
            <LogOut size={17} />
          </button>
          <LanguageControl />
          <button
            type="button"
            className="nv-theme-toggle"
            onClick={theme.toggleTheme}
            aria-label={s("تغییر پوسته", "Toggle theme")}
          >
            {theme.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      <div className="nv-shop-account-layout">
        <aside className="nv-shop-account-sidebar">
          <div className="nv-shop-identity">
            <span>
              <UserRound size={26} />
            </span>
            <strong>{name}</strong>
            <small>{s("پنل خرید تجهیزات", "Equipment account")}</small>
          </div>
          <nav aria-label={s("منوی پنل فروشگاه", "Shop account navigation")}>
            {nav.map(([id, Icon, label]) => (
              <button
                type="button"
                key={id}
                aria-current={tab === id ? "page" : undefined}
                onClick={() => choose(id)}
              >
                <Icon size={19} />
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            disabled={busy}
            onClick={() => void signOut()}
            className="nv-shop-signout"
          >
            <LogOut size={18} />
            {s("خروج از حساب", "Sign out")}
          </button>
        </aside>
        <main className="nv-shop-account-main">
          <div className="nv-shop-account-title">
            <div>
              <span>{s("حساب رک‌ویرا", "YOUR RACKVIRA ACCOUNT")}</span>
              <h1>{nav.find((v) => v[0] === tab)?.[2]}</h1>
              <p>
                {s(
                  "سفارش تجهیزات، نشانی‌ها و صورتحساب‌های شما.",
                  "Track orders, addresses and invoices in one place.",
                )}
              </p>
            </div>
          </div>
          {(shop.error || panel.error) && (
            <div role="alert" className="nv-shop-account-error">
              <p>{shop.error || panel.error}</p>
              <button
                type="button"
                onClick={() => {
                  void shop.refresh();
                  void panel.refresh();
                }}
              >
                <RefreshCw size={16} />
                {s("تلاش مجدد", "Retry")}
              </button>
            </div>
          )}
          {message && (
            <p role="status" className="nv-shop-account-message">
              {message}
            </p>
          )}
          {!shop.ready ? (
            <div className="nv-shop-account-skeleton" aria-busy="true" />
          ) : tab === "invoices" ? (
            <ShopInvoices
              documents={shop.data.documents || []}
              preview={preview}
            />
          ) : tab === "overview" ? (
            <>
              <div className="nv-shop-account-welcome">
                <div>
                  <span className="nv-eyebrow">
                    {s("سلام، " + name, "Hello, " + name)}
                  </span>
                  <h2>
                    {s(
                      "همه خریدها، یک جای مشخص.",
                      "Your purchases. One clear place.",
                    )}
                  </h2>
                  <p>
                    {s(
                      "درخواست تأمین، وضعیت سفارش و نشانی‌های تحویل را از اینجا پیگیری کنید.",
                      "Track equipment enquiries, order progress and delivery addresses here.",
                    )}
                  </p>
                  <button
                    type="button"
                    className="nv-button"
                    onClick={() => choose("enquiry")}
                  >
                    <Plus size={17} />
                    {s("درخواست تأمین تجهیزات", "Request equipment")}
                  </button>
                </div>
                <div className="nv-shop-welcome-art" aria-hidden="true">
                  <Package size={72} />
                  <ShoppingBag size={38} />
                  <Check size={25} />
                </div>
              </div>
              <div className="nv-shop-account-stats">
                {[
                  [
                    Package,
                    s("درخواست‌ها و سفارش‌ها", "Requests & orders"),
                    shop.error ? "—" : n(orders.length),
                  ],
                  [
                    ClipboardList,
                    s("در انتظار استعلام", "Awaiting quote"),
                    shop.error
                      ? "—"
                      : n(
                          orders.filter((v) => v.status === "requested").length,
                        ),
                  ],
                  [
                    FileText,
                    s("صورتحساب‌ها", "Documents"),
                    n((shop.data.documents || []).length),
                  ],
                ].map(([Icon, label, value]) => {
                  const I = Icon as typeof Package;
                  return (
                    <article key={String(label)}>
                      <I size={24} />
                      <span>{String(label)}</span>
                      <strong>{String(value)}</strong>
                    </article>
                  );
                })}
              </div>
              <div className="nv-shop-account-card">
                <div className="nv-shop-card-title">
                  <h2>
                    {s(
                      "آخرین درخواست‌ها و سفارش‌ها",
                      "Recent requests & orders",
                    )}
                  </h2>
                  <button type="button" onClick={() => choose("orders")}>
                    {s("مشاهده همه", "View all")}
                  </button>
                </div>
                {!shop.error &&
                  (orders.length
                    ? orderRows().slice(0, 3)
                    : empty(
                        s("هنوز خریدی ثبت نشده", "No purchases yet"),
                        s(
                          "با دیدن تجهیزات یا ثبت درخواست تأمین شروع کنید.",
                          "Start by browsing equipment or making an enquiry.",
                        ),
                      ))}
              </div>
            </>
          ) : tab === "orders" ? (
            <div className="nv-shop-account-card">
              <div className="nv-shop-card-title">
                <h2>{s("پیگیری سفارش تجهیزات", "Track equipment orders")}</h2>
                <button type="button" onClick={() => choose("enquiry")}>
                  <Plus size={16} />
                  {s("درخواست جدید", "New enquiry")}
                </button>
              </div>
              {!shop.error &&
                (orders.length
                  ? orderRows()
                  : empty(
                      s("سفارشی ندارید", "No orders"),
                      s(
                        "درخواست‌های استعلام هم از همین بخش قابل پیگیری‌اند.",
                        "Your quote requests will also appear here.",
                      ),
                    ))}
            </div>
          ) : tab === "enquiry" ? (
            <form
              className="nv-shop-account-card nv-shop-account-form"
              onSubmit={(e) => {
                e.preventDefault();
                void perform(
                  "enquiry-create",
                  { description, quantity, addressId },
                  () => {
                    try { sessionStorage.removeItem(shopEnquiryDraftKey); } catch {}
                    setDescription("");
                    choose("orders");
                  },
                );
              }}
            >
              <h2>
                {s("چه تجهیزاتی نیاز دارید؟", "What equipment do you need?")}
              </h2>
              <p>
                {s(
                  "این فرم درخواست استعلام ثبت می‌کند. قیمت، موجودی و ارسال پس از بررسی اعلام می‌شوند و پرداختی انجام نمی‌شود.",
                  "This creates a quote enquiry. Price, stock and delivery are confirmed after review. No payment is taken.",
                )}
              </p>
              <label>
                {s(
                  "شرح تجهیزات، مدل موردنظر و کاربرد",
                  "Equipment, preferred model and intended use",
                )}
                <textarea
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <div className="nv-shop-form-row">
                <label>
                  {s("تعداد", "Quantity")}
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </label>
                <label>
                  {s("نشانی برای بررسی ارسال", "Address for delivery review")}
                  <select
                    value={addressId}
                    onChange={(e) => setAddressId(e.target.value)}
                  >
                    <option value="">
                      {s("بعداً مشخص می‌کنم", "Choose later")}
                    </option>
                    {shop.data.addresses.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label || v.city} · {v.recipient}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="submit"
                disabled={busy || !!shop.error}
                className="nv-button"
              >
                {s("ثبت درخواست استعلام", "Submit quote enquiry")}
              </button>
            </form>
          ) : tab === "addresses" ? (
            <div className="nv-shop-account-card">
              <div className="nv-shop-card-title">
                <h2>{s("نشانی‌های تحویل", "Delivery addresses")}</h2>
                <button
                  type="button"
                  disabled={!!shop.error}
                  onClick={() =>
                    setAddress({
                      label: "",
                      recipient: "",
                      city: "",
                      postalCode: "",
                      street: "",
                      country: "IR",
                    })
                  }
                >
                  <Plus size={16} />
                  {s("نشانی جدید", "New address")}
                </button>
              </div>
              {address && (
                <form
                  className="nv-shop-account-form nv-shop-address-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void perform(
                      "address-save",
                      { id: address.id, address },
                      () => setAddress(null),
                    );
                  }}
                >
                  <div className="nv-shop-form-row">
                    {(
                      [
                        ["label", s("عنوان نشانی", "Address label")],
                        ["recipient", s("نام گیرنده", "Recipient")],
                        ["city", s("شهر", "City")],
                        ["postalCode", s("کد پستی", "Postal code")],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <input
                          required={key !== "label"}
                          inputMode={key === "postalCode" ? "numeric" : "text"}
                          value={String(address[key] || "")}
                          maxLength={key === "postalCode" ? 10 : 120}
                          onChange={(e) =>
                            setAddress({ ...address, [key]: e.target.value })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <label>
                    {s("نشانی کامل", "Full address")}
                    <textarea
                      required
                      minLength={10}
                      rows={3}
                      value={address.street || ""}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                    />
                  </label>
                  <p>
                    {s(
                      "ثبت نشانی به معنی تأیید پوشش ارسال نیست؛ روش و هزینه تحویل پس از استعلام تعیین می‌شود.",
                      "Saving an address does not confirm delivery coverage. Methods and charges are quoted separately.",
                    )}
                  </p>
                  <div className="nv-button-row">
                    <button type="submit" className="nv-button" disabled={busy}>
                      {s("ذخیره نشانی", "Save address")}
                    </button>
                    <button
                      type="button"
                      className="nv-button nv-button-outline"
                      onClick={() => setAddress(null)}
                    >
                      {s("انصراف", "Cancel")}
                    </button>
                  </div>
                </form>
              )}
              <div className="nv-shop-address-grid">
                {shop.data.addresses.map((v) => (
                  <article key={v.id}>
                    <MapPin size={23} />
                    <h3>{v.label || v.city}</h3>
                    <strong>{v.recipient}</strong>
                    <p>
                      {v.city} · {v.street}
                    </p>
                    <small>
                      {s("کد پستی: ", "Postal code: ")}
                      {n(v.postalCode)}
                    </small>
                    <div>
                      <button type="button" onClick={() => setAddress(v)}>
                        {s("ویرایش", "Edit")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void perform("address-delete", { id: v.id })
                        }
                      >
                        <Trash2 size={15} />
                        {s("حذف", "Delete")}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {!shop.data.addresses.length &&
                !address &&
                !shop.error &&
                empty(
                  s("نشانی ثبت نکرده‌اید", "No saved addresses"),
                  s(
                    "نشانی‌ها فقط در حساب خودتان قابل مشاهده‌اند.",
                    "Addresses are visible only within your account.",
                  ),
                )}
            </div>
          ) : tab === "favorites" ? (
            <div className="nv-shop-account-card">
              <h2>{s("علاقه‌مندی‌های فروشگاه", "Your saved equipment")}</h2>
              {shop.data.favorites.length
                ? shop.data.favorites.map((v) => (
                    <article className="nv-shop-saved-row" key={v.id}>
                      <Heart size={20} />
                      <strong>{fa ? v.nameFa : v.nameEn}</strong>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void perform("favorite-remove", { productId: v.id })
                        }
                      >
                        {s("حذف", "Remove")}
                      </button>
                    </article>
                  ))
                : empty(
                    s("محصول ذخیره‌شده‌ای ندارید", "No saved products"),
                    s(
                      "علاقه‌مندی حساب به محصولات واقعی و تأییدشده متصل می‌شود؛ پروفایل‌های نمایشی فروشگاه موجودی واقعی نیستند.",
                      "Account bookmarks use real verified products. The store’s display profiles are not actual inventory.",
                    ),
                  )}
            </div>
          ) : (
            <AccountProfileForm />
          )}
        </main>
      </div>
    </div>
  );
}
