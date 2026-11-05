import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Moon, Sun, UserRound } from "lucide-react";
import BrandLogo from "../BrandLogo";
import LanguageControl from "../LanguageControl";
import { useSiteCopy } from "./site-copy";
import { useTheme } from "@/contexts/ThemeContext";
import "./public-site.css";
import "./catalog-experience.css";
import "./public-dark.css";
export function DirectionArrow({ size = 18 }: { size?: number }) {
  return useSiteCopy().fa ? (
    <ArrowLeft size={size} />
  ) : (
    <ArrowRight size={size} />
  );
}
export default function SiteLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const { s, fa } = useSiteCopy(),
    { theme, toggleTheme } = useTheme();
  useEffect(() => {
    document.title = title + " | " + s("رک‌ویرا", "RackVira");
  }, [title, s]);
  return (
    <div className="nv-site rv-site" dir={fa ? "rtl" : "ltr"}>
      <header className="rv-header">
        <div className="nv-container">
          <Link to="/" aria-label={s("خانهٔ رک‌ویرا", "RackVira home")}>
            <BrandLogo />
          </Link>
          <nav aria-label={s("منوی فروشگاه", "Store navigation")}>
            <Link className="rv-account-link" to="/account">
              <UserRound size={18} />
              {s("حساب من", "My account")}
            </Link>
            <LanguageControl />
            <button
              className="nv-theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={s("تغییر پوسته", "Toggle theme")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="rv-footer">
        <div className="nv-container">
          <Link to="/">
            <BrandLogo />
          </Link>
          <p>
            {s(
              "فروشگاه تخصصی تجهیزات شبکه",
              "Specialist network equipment store",
            )}
          </p>
          <Link to="/account?section=enquiry">
            {s("استعلام خرید", "Request a quote")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
