import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LangProvider } from "./context/LangContext";
import Inicio from "./pages/Inicio";
import CRM from "./pages/CRM";
import Politicas from "./pages/Politicas";
import DisenoWeb from "./pages/DisenoWeb";
import SeoLocal from "./pages/SeoLocal";
import GoogleAds from "./pages/GoogleAds";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <LangProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/planes" element={<Navigate to="/#planes" replace />} />
                <Route path="/politicas" element={<Politicas />} />
                <Route path="/diseno-web" element={<DisenoWeb />} />
                <Route path="/seo-local" element={<SeoLocal />} />
                <Route path="/google-ads" element={<GoogleAds />} />
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
