import { ArrowDownRight, ArrowUpRight, Bot, ChartNoAxesCombined, Package, Plus, Receipt, Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { authApi, type BusinessSummary } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {const [summaries, setSummaries] = useState<BusinessSummary[]>([]);
const navigate = useNavigate();
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  async function loadBusinessSummary() {
    try {
      const data = await authApi.getBusinessSummary();
      setSummaries(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load business summary."
      );
    } finally {
      setLoading(false);
    }
  }

  loadBusinessSummary();
}, []);

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);


  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">MONDAY, NOVEMBER 2, 2026</div>
          <h1>Good morning! 👋</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        <button className="primary-button" onClick={() => navigate("/sales")}>
        <Plus size={18} /> Record a sale
        </button>      
    </div>

      <section className="ai-banner">
        <div className="ai-banner-icon"><Sparkles size={23} /></div>
        <div className="ai-banner-text">
          <strong>Your business, powered by AI</strong>
          <p>Ask TradePilot to analyse your sales, track expenses and uncover business insights.</p>
        </div>
        <button onClick={() => navigate("/assistant")}>
          Explore AI Assistant <ArrowUpRight size={16} />
        </button>
      </section>

      <div className="section-heading">
        <div>
          <h2>Business overview</h2>
          <p>Your financial snapshot</p>
        </div>
        <span className="period-select">All recorded transactions</span>
      </div>

<section className="stats-grid">
  {loading ? (
    <p>Loading business summary...</p>
  ) : error ? (
    <p className="auth-error">{error}</p>
  ) : summaries.length === 0 ? (
    <p>No financial transactions recorded yet.</p>
  ) : (
    summaries.map((summary) => (
      <div className="currency-summary" key={summary.currency}>

        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue, summary.currency)}
          change="Recorded sales"
          icon={<Wallet size={20} />}
          color="green"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses, summary.currency)}
          change="Recorded expenses"
          icon={<Receipt size={20} />}
          color="orange"
        />

        <StatCard
          title="Net Cash Flow"
          value={formatCurrency(summary.netCashFlow, summary.currency)}
          change="Revenue − expenses"
          icon={<ChartNoAxesCombined size={20} />}
          color="blue"
        />
      </div>
    ))
  )}

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
          <button className="chat-button" onClick={() => navigate("/assistant")}>
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