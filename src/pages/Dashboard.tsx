import { ArrowDownRight, ArrowUpRight, Bot, ChartNoAxesCombined, Package, Plus, Receipt, Sparkles, Wallet } from "lucide-react";

export default function Dashboard() {
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