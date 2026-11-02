
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  ChartNoAxesCombined,
  Bot,
  Settings,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Menu,
  X,
  Plus,
  Sparkles,
} from "lucide-react";
import "./index.css";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Sales", icon: ShoppingCart },
  { name: "Inventory", icon: Package },
  { name: "Expenses", icon: Receipt },
  { name: "Analytics", icon: ChartNoAxesCombined },
  { name: "AI Assistant", icon: Bot },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><ChartNoAxesCombined size={23} /></div>
          <span>TradePilot<span className="brand-ai"> AI</span></span>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${activePage === name ? "active" : ""}`}
              onClick={() => {
                setActivePage(name);
                setSidebarOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "AI Assistant" && <span className="new-label">AI</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>
          <div className="profile">
            <div className="avatar">IO</div>
            <div>
              <strong>Business Owner</strong>
              <span>Free Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="breadcrumb">Workspace <span>/</span> {activePage}</div>
          <div className="topbar-actions">
            <button className="icon-button"><Search size={19} /></button>
            <button className="icon-button notification"><Bell size={19} /></button>
            <div className="top-avatar">IO</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" ? (
            <Dashboard />
          ) : (
            <div className="placeholder-page">
              <div className="placeholder-icon"><Sparkles size={28} /></div>
              <h2>{activePage}</h2>
              <p>This section is coming next. We're building TradePilot AI one feature at a time.</p>
              <button className="primary-button" onClick={() => setActivePage("Dashboard")}>
                Return to dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">MONDAY, NOVEMBER 2, 2026</div>
          <h1>Good morning! 👋</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        <button className="primary-button"><Plus size={18} /> Record a sale</button>
      </div>

      <section className="ai-banner">
        <div className="ai-banner-icon"><Sparkles size={23} /></div>
        <div className="ai-banner-text">
          <strong>Your business, powered by AI</strong>
          <p>Ask TradePilot to analyse your sales, track expenses and uncover business insights.</p>
        </div>
        <button onClick={() => window.dispatchEvent(new Event("open-ai"))}>
          Explore AI Assistant <ArrowUpRight size={16} />
        </button>
      </section>

      <div className="section-heading">
        <div>
          <h2>Business overview</h2>
          <p>Your financial snapshot</p>
        </div>
        <select defaultValue="week" className="period-select">
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>

      <section className="stats-grid">
        <StatCard
          title="Total Revenue"
          value="₦585,000"
          change="Previous period"
          icon={<Wallet size={20} />}
          color="green"
          direction="up"
        />
        <StatCard
          title="Total Expenses"
          value="₦15,000"
          change="Previous period"
          icon={<Receipt size={20} />}
          color="orange"
          direction="down"
        />
        <StatCard
          title="Net Cash Flow"
          value="₦570,000"
          change="Revenue − expenses"
          icon={<ChartNoAxesCombined size={20} />}
          color="blue"
          direction="up"
        />
        <StatCard
          title="Inventory"
          value="Products"
          change="Manage your stock"
          icon={<Package size={20} />}
          color="purple"
        />
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Financial activity</h3>
              <p>Revenue and expenses overview</p>
            </div>
            <span className="panel-badge">NGN</span>
          </div>
          <div className="chart-placeholder">
            <ChartNoAxesCombined size={36} />
            <strong>Financial analytics</strong>
            <span>Connect your financial data to view trends here.</span>
          </div>
        </div>

        <div className="panel assistant-panel">
          <div className="panel-heading">
            <div>
              <h3>Ask TradePilot AI</h3>
              <p>Your intelligent business assistant</p>
            </div>
            <div className="online-dot" />
          </div>
          <div className="assistant-message">
            <div className="assistant-icon"><Bot size={21} /></div>
            <p>Hello! I'm TradePilot AI. I can help you understand your business performance and make better decisions.</p>
          </div>
          <div className="suggestion">How is my business performing?</div>
          <div className="suggestion">Compare this week's revenue</div>
          <button className="chat-button" onClick={() => window.dispatchEvent(new Event("open-ai"))}>
            Start a conversation <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      <footer className="footer">
        TradePilot AI <span>•</span> Smarter decisions. Better business.
      </footer>
    </>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  color,
  direction,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
  direction?: "up" | "down";
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>{icon}</div>
      </div>
      <h2>{value}</h2>
      <div className="stat-caption">
        {direction && (direction === "up"
          ? <ArrowUpRight size={15} className="positive" />
          : <ArrowDownRight size={15} className="negative" />)}
        <span>{change}</span>
      </div>
    </div>
  );
}

export default App;
