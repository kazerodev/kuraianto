import { useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LangProvider, useLang } from "./context/LangContext";
const Inicio = lazy(() => import("./pages/Inicio"));
import KitIA from "./pages/KitIA";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

const Politicas = lazy(() => import("./pages/Politicas"));
const DisenoWeb = lazy(() => import("./pages/DisenoWeb"));
const SeoLocal = lazy(() => import("./pages/SeoLocal"));
const GoogleAds = lazy(() => import("./pages/GoogleAds"));
const Gracias = lazy(() => import("./pages/Gracias"));
const Empezar = lazy(() => import("./pages/Empezar"));
const NoEncontrado = lazy(() => import("./pages/NoEncontrado"));
const KitGracias = lazy(() => import("./pages/KitGracias"));
const KitCondiciones = lazy(() => import("./pages/KitCondiciones"));

function LangSync() {
  const location = useLocation();
  const ctx = useLang() as { setLang: (code: string) => void } | null;

  useEffect(() => {
    if (!ctx) return;
    const path = location.pathname;
    if (path === "/en") ctx.setLang("en");
    else if (path === "/nl") ctx.setLang("nl");
    else if (path === "/fr") ctx.setLang("fr");
  }, [location.pathname]);

  return null;
}

const RUTAS_KIT = ["/", "/kit-ia", "/kit-ia/gracias", "/kit-ia/condiciones"];

function Marco({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const esKit = RUTAS_KIT.includes(location.pathname.replace(/\/$/, "") || "/");
  if (esKit) return <main>{children}</main>;
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <LangProvider>
        <Router>
          <LangSync />
          <Marco>
              <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
                <Routes>
                  <Route path="/" element={<KitIA />} />
                  <Route path="/kit-ia" element={<KitIA />} />
                  <Route path="/kit-ia/gracias" element={<KitGracias />} />
                  <Route path="/kit-ia/condiciones" element={<KitCondiciones />} />
                  <Route path="/webs" element={<Inicio />} />
                  <Route path="/en" element={<Inicio />} />
                  <Route path="/nl" element={<Inicio />} />
                  <Route path="/fr" element={<Inicio />} />
                  <Route path="/planes" element={<Navigate to="/webs#planes" replace />} />
                  <Route path="/politicas" element={<Politicas />} />
                  <Route path="/diseno-web" element={<DisenoWeb />} />
                  <Route path="/seo-local" element={<SeoLocal />} />
                  <Route path="/google-ads" element={<GoogleAds />} />
                  <Route path="/gracias" element={<Gracias />} />
                  <Route path="/empezar" element={<Empezar />} />
                  <Route path="*" element={<NoEncontrado />} />
                </Routes>
              </Suspense>
          </Marco>
          <CookieBanner />
        </Router>
      </LangProvider>
    </HelmetProvider>
  );
};

export default App;
