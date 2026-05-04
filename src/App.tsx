import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LangProvider } from "./context/LangContext";
import Inicio from "./pages/Inicio";
import CRM from "./pages/CRM";
import Planes from "./pages/Planes";
import Politicas from "./pages/Politicas";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";

const App: React.FC = () => {
  return (
    <LangProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/planes" element={<Planes />} />
              <Route path="/politicas" element={<Politicas />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <CookieBanner />
      </Router>
    </LangProvider>
  );
};

export default App;
