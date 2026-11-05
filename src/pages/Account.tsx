import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PanelDataProvider } from "@/contexts/PanelDataContext";
import ShopAccountLayout from "@/components/shop/ShopAccountLayout";
import SiteLayout from "@/components/public/SiteLayout";
import { useSiteCopy } from "@/components/public/site-copy";
import { normalizeDigits } from "@/lib/localized-number";
export default function Account({ preview = false }: { preview?: boolean }) {
  const { s } = useSiteCopy(),
    location = useLocation();
  const [session, setSession] = useState<Session | null | undefined>(undefined),
    [verified, setVerified] = useState("loading"),
    [factor, setFactor] = useState(""),
    [code, setCode] = useState(""),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (preview || !supabase) return;
    const client = supabase;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, value) => {
      if (event === "PASSWORD_RECOVERY") {
        setSession(null);
        return;
      }
      setSession(value);
    });
    return () => subscription.unsubscribe();
  }, [preview]);
  useEffect(() => {
    let active = true;
    if (!session || !supabase) return;
    const auth = supabase.auth;
    setVerified("loading");
    void (async () => {
      const { data, error } = await auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active) return;
      if (error || !data) {
        setVerified("failed");
        return;
      }
      if (data.nextLevel === "aal2" && data.currentLevel !== "aal2") {
        const result = await auth.mfa.listFactors();
        if (!active) return;
        const id = result.data?.totp.find((v) => v.status === "verified")?.id;
        if (!id) {
          setVerified("failed");
          return;
        }
        setFactor(id);
        setVerified("mfa");
      } else setVerified("ready");
    })().catch(() => {
      if (active) setVerified("failed");
    });
    return () => {
      active = false;
    };
  }, [session]);
  if (preview && import.meta.env.DEV)
    return (
      <PanelDataProvider preview>
        <ShopAccountLayout preview />
      </PanelDataProvider>
    );
  if (!supabase || session === null)
    return (
      <Navigate
        replace
        to={
          "/auth?next=" +
          encodeURIComponent(location.pathname + location.search)
        }
      />
    );
  if (session && verified === "ready")
    return (
      <PanelDataProvider key={session.user.id}>
        <ShopAccountLayout />
      </PanelDataProvider>
    );
  async function checkCode(e: FormEvent) {
    e.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError(false);
    try {
      const result = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor,
        code: normalizeDigits(code).trim(),
      });
      if (result.error) setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <SiteLayout title={s("حساب رک‌ویرا", "RackVira account")}>
      <section className="rv-auth-card">
        {verified === "mfa" ? (
          <form onSubmit={checkCode}>
            <h1>{s("تأیید دو مرحله‌ای", "Authenticator verification")}</h1>
            <label>
              {s("کد نرم‌افزار", "Authenticator code")}
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </label>
            {error && (
              <p role="alert">
                {s("کد پذیرفته نشد.", "Code was not accepted.")}
              </p>
            )}
            <button disabled={busy} className="nv-button">
              {s("تأیید", "Verify")}
            </button>
          </form>
        ) : (
          <h1>
            {verified === "failed"
              ? s("نشست قابل تأیید نیست", "Could not verify session")
              : s("در حال بررسی حساب", "Checking your account")}
          </h1>
        )}
        {verified !== "loading" && (
          <button
            type="button"
            className="nv-back-button"
            onClick={() => void supabase?.auth.signOut()}
          >
            {s("خروج از حساب", "Sign out")}
          </button>
        )}
        <Link to="/" className="nv-text-link">
          {s("بازگشت به فروشگاه", "Back to store")}
        </Link>
      </section>
    </SiteLayout>
  );
}
