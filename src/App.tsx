import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LangProvider, useLang } from "./context/LangContext";
import Inicio from "./pages/Inicio";
import CRM from "./pages/CRM";
import Politicas from "./pages/Politicas";
import DisenoWeb from "./pages/DisenoWeb";
import SeoLocal from "./pages/SeoLocal";
import GoogleAds from "./pages/GoogleAds";
import Gracias from "./pages/Gracias";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

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

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <LangProvider>
        <Router>
          <LangSync />
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/en" element={<Inicio />} />
                <Route path="/nl" element={<Inicio />} />
                <Route path="/fr" element={<Inicio />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/planes" element={<Navigate to="/#planes" replace />} />
                <Route path="/politicas" element={<Politicas />} />
                <Route path="/diseno-web" element={<DisenoWeb />} />
                <Route path="/seo-local" element={<SeoLocal />} />
                <Route path="/google-ads" element={<GoogleAds />} />
                <Route path="/gracias" element={<Gracias />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <CookieBanner />
        </Router>
      </LangProvider>
    </HelmetProvider>
  );
};

export default App;
