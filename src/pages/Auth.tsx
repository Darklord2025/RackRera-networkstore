import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SiteLayout from "@/components/public/SiteLayout";
import BrandLogo from "@/components/BrandLogo";
import { useSiteCopy } from "@/components/public/site-copy";
function accountTarget(v: string | null) {
  if (!v) return "/account";
  try {
    const u = new URL(v, location.origin);
    return u.origin === location.origin && u.pathname === "/account"
      ? u.pathname + u.search
      : "/account";
  } catch {
    return "/account";
  }
}
export default function Auth() {
  const { s } = useSiteCopy(),
    [params] = useSearchParams(),
    navigate = useNavigate();
  const next = accountTarget(params.get("next")),
    recovery = params.get("mode") === "recovery";
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(false),
    [recoveryReady, setRecoveryReady] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (recovery) {
        if (event === "PASSWORD_RECOVERY") setRecoveryReady(true);
        return;
      }
      if (
        session?.user.email_confirmed_at &&
        (event === "SIGNED_IN" || event === "INITIAL_SESSION")
      )
        navigate(next, { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate, next, recovery]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError(false);
    setMessage("");
    try {
      if (recovery) {
        if (!recoveryReady) throw Error();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        navigate("/account", { replace: true });
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: location.origin + "/auth?mode=recovery" },
        );
        if (error) throw error;
        setMessage(
          s(
            "اگر حسابی با این ایمیل وجود داشته باشد، پیوند بازیابی ارسال می‌شود.",
            "If the address has an account, a recovery link will be sent.",
          ),
        );
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo:
              location.origin + "/auth?next=" + encodeURIComponent(next),
          },
        });
        if (error) throw error;
        setMessage(
          s(
            "برای تأیید حساب، پیوند ارسال‌شده به ایمیل را باز کنید.",
            "Open the verification link sent to your email.",
          ),
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error || !data.user?.email_confirmed_at) throw error;
        navigate(next, { replace: true });
      }
    } catch {
      setError(true);
      setMessage(
        s(
          "درخواست انجام نشد. اطلاعات ورود یا پیوند ایمیل را بررسی کنید.",
          "The request failed. Check your credentials or email link.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  const title = recovery
    ? s("رمز جدید", "New password")
    : mode === "signup"
      ? s("ساخت حساب", "Create account")
      : mode === "reset"
        ? s("بازیابی رمز", "Reset password")
        : s("ورود به رک‌ویرا", "Sign in to RackVira");
  return (
    <SiteLayout title={title}>
      <section className="rv-auth-card">
        <div className="rv-auth-brand">
          <BrandLogo />
          <ShieldCheck size={24} />
        </div>
        <h1>{title}</h1>
        <p>
          {s(
            "سفارش‌ها، استعلام و فاکتورهای تجهیزات را از اینجا مدیریت کنید.",
            "Manage equipment orders, enquiries and invoices.",
          )}
        </p>
        {!supabase ? (
          <div className="rv-disconnected" role="status">
            <strong>
              {s("ورود هنوز فعال نیست", "Sign-in is not enabled yet")}
            </strong>
            <p>
              {s(
                "فروشگاه در حال آماده‌سازی است. فعلاً می‌توانید کاتالوگ را مرور کنید.",
                "The store is being set up. You can still browse the catalog.",
              )}
            </p>
            {import.meta.env.DEV && (
              <Link
                className="nv-button"
                to={next.replace("/account", "/preview/account")}
              >
                {s("پیش‌نمایش پنل خرید", "Preview the account")}
              </Link>
            )}
          </div>
        ) : (
          <form onSubmit={submit}>
            {!recovery && (
              <label>
                {s("ایمیل", "Email")}
                <input
                  dir="ltr"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {(recovery || mode !== "reset") && (
              <label>
                {s("رمز عبور", "Password")}
                <input
                  dir="ltr"
                  type="password"
                  autoComplete={
                    mode === "login" && !recovery
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={mode === "login" && !recovery ? 1 : 8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}
            {message && <p role={error ? "alert" : "status"}>{message}</p>}
            <button
              className="nv-button"
              disabled={busy || (recovery && !recoveryReady)}
            >
              {title}
            </button>
          </form>
        )}
        {!!supabase && !recovery && (
          <div className="rv-auth-actions">
            {(["login", "signup", "reset"] as const)
              .filter((v) => v !== mode)
              .map((v) => (
                <button
                  key={v}
                  type="button"
                  className="nv-back-button"
                  onClick={() => {
                    setMode(v);
                    setMessage("");
                    setPassword("");
                  }}
                >
                  {v === "login"
                    ? s("ورود", "Sign in")
                    : v === "signup"
                      ? s("ایجاد حساب", "Create account")
                      : s("فراموشی رمز", "Forgot password")}
                </button>
              ))}
          </div>
        )}
        <Link to="/" className="nv-text-link">
          {s("بازگشت به فروشگاه", "Back to store")}
        </Link>
      </section>
    </SiteLayout>
  );
}
