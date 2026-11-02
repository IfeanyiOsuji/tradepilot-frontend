
import {
  Bot,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Sales", path: "/sales", icon: ShoppingCart },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Expenses", path: "/expenses", icon: Receipt },
  { label: "AI Assistant", path: "/assistant", icon: Bot },
];

export default function SideBar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    navigate("/login", { replace: true });
  }

  return (
    <aside className="tp-sidebar">
      <div className="tp-sidebar-brand">
        <div className="tp-brand-icon">
          <ChartNoAxesCombined size={22} />
        </div>
        <div>
          <strong>TradePilot AI</strong>
          <span>Business workspace</span>
        </div>
      </div>

      <div className="tp-sidebar-label">WORKSPACE</div>

      <nav className="tp-sidebar-nav" aria-label="Main navigation">
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `tp-nav-link ${isActive ? "tp-nav-active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="tp-sidebar-footer">
        <button
          type="button"
          className="tp-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
