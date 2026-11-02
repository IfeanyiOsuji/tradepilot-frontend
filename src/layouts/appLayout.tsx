
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import SideBarr from "../components/Sidebar";
import { clearSession } from "../utils/session";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu when navigation changes.
  const [previousPath, setPreviousPath] = useState(location.pathname);

  if (previousPath !== location.pathname) {
    setPreviousPath(location.pathname);
    setMenuOpen(false);
  }

  return (
    <div className="tp-app-layout">
      <div className={`tp-sidebar-wrapper ${menuOpen ? "tp-menu-open" : ""}`}>
        <SideBarr />
      </div>

      {menuOpen && (
        <button
          className="tp-mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="tp-main-area">
        <header className="tp-mobile-header">
          <strong>TradePilot AI</strong>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

          <button
         type="button"
            onClick={clearSession}
            className="logout-button"
            >
         Logout
        </button>
        </header>

        <main className="tp-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
