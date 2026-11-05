import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import EquipmentStore from "./components/public/EquipmentStore";
import SiteLayout from "./components/public/SiteLayout";
import { useSiteCopy } from "./components/public/site-copy";
import "./invoice.css";
import "./rackvira.css";
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
function Missing() {
  const { s } = useSiteCopy();
  return (
    <SiteLayout title="404">
      <section className="nv-container rv-missing">
        <h1>{s("این صفحه پیدا نشد", "Page not found")}</h1>
        <Link className="nv-button" to="/">
          {s("فروشگاه", "Store")}
        </Link>
      </section>
    </SiteLayout>
  );
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <LanguageProvider>
      <ThemeProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<EquipmentStore />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            {import.meta.env.DEV && (
              <Route path="/preview/account" element={<Account preview />} />
            )}
            <Route path="*" element={<Missing />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </LanguageProvider>
  </BrowserRouter>,
);
