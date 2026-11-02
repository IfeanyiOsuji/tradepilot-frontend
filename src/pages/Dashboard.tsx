
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  ChartNoAxesCombined,
  Package,
  Plus,
  Receipt,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  authApi,
  type BusinessSummary,
  type DailyFinancialTrendResponse,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLastSevenDays() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);

  return {
    startDate: toLocalDateString(start),
    endDate: toLocalDateString(end),
  };
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatCompactAmount(value: number) {
  return new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [summaries, setSummaries] = useState<BusinessSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trends, setTrends] = useState<DailyFinancialTrendResponse[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [trendsError, setTrendsError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");

  const storedUser = localStorage.getItem("user");

const currentUser = storedUser
  ? JSON.parse(storedUser)
  : null;

const firstName = currentUser?.fullName?.trim().split(/\s+/)[0] || "";

  useEffect(() => {
    async function loadDashboard() {
      const { startDate, endDate } = getLastSevenDays();

      const [summaryResult, trendResult] = await Promise.allSettled([
        authApi.getBusinessSummary(),
        authApi.getDailyFinancialTrends(startDate, endDate),
      ]);

      if (summaryResult.status === "fulfilled") {
        setSummaries(summaryResult.value);
      } else {
        setError(
          summaryResult.reason instanceof Error
            ? summaryResult.reason.message
            : "Unable to load business summary."
        );
      }

      if (trendResult.status === "fulfilled") {
        setTrends(trendResult.value);
      } else {
        setTrendsError(
          trendResult.reason instanceof Error
            ? trendResult.reason.message
            : "Unable to load financial trends."
        );
      }

      setLoading(false);
      setTrendsLoading(false);
    }

    void loadDashboard();
  }, []);

  const currencies = Array.from(
    new Set([
      ...summaries.map((summary) => summary.currency),
      ...trends.map((trend) => trend.currency),
    ])
  ).sort();

  const activeCurrency = currencies.includes(selectedCurrency)
    ? selectedCurrency
    : currencies[0] ?? selectedCurrency;

  const { startDate, endDate } = getLastSevenDays();

  // Create all seven calendar dates, including days without transactions.
  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${startDate}T12:00:00`);
    date.setDate(date.getDate() + index);

    const dateKey = toLocalDateString(date);

    const dailyRecords = trends.filter(
      (trend) =>
        trend.date === dateKey && trend.currency === activeCurrency
    );

    const sales = dailyRecords.reduce(
      (total, trend) => total + Number(trend.sales ?? 0),
      0
    );

    const expenses = dailyRecords.reduce(
      (total, trend) => total + Number(trend.expenses ?? 0),
      0
    );

    return {
      date: dateKey,
      label: date.toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      }),
      sales,
      expenses,
    };
  });

  const hasFinancialActivity = chartData.some(
    (day) => day.sales !== 0 || day.expenses !== 0
  );

  const todayLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">{todayLabel}</div>
          <h1>
            Welcome back{firstName ? `, ${firstName}` : ""}! 👋
        </h1>
          <p>Here's what's happening with your business today.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/sales")}
        >
          <Plus size={18} /> Record a sale
        </button>
      </div>

      <section className="ai-banner">
        <div className="ai-banner-icon">
          <Sparkles size={23} />
        </div>

        <div className="ai-banner-text">
          <strong>Your business, powered by AI</strong>
          <p>
            Ask TradePilot to analyse your sales, track expenses
            and uncover business insights.
          </p>
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

        <span className="period-select">
          All recorded transactions
        </span>
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
            <div
              className="currency-summary"
              key={summary.currency}
            >
              <StatCard
                title="Total Revenue"
                value={formatCurrency(
                  summary.totalRevenue,
                  summary.currency
                )}
                change="Recorded sales"
                icon={<Wallet size={20} />}
                color="green"
              />

              <StatCard
                title="Total Expenses"
                value={formatCurrency(
                  summary.totalExpenses,
                  summary.currency
                )}
                change="Recorded expenses"
                icon={<Receipt size={20} />}
                color="orange"
              />

              <StatCard
                title="Net Cash Flow"
                value={formatCurrency(
                  summary.netCashFlow,
                  summary.currency
                )}
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
              <p>
                Daily revenue and expenses · {startDate} to {endDate}
              </p>
            </div>

            {currencies.length > 0 && (
              <select
                className="period-select"
                value={activeCurrency}
                onChange={(event) =>
                  setSelectedCurrency(event.target.value)
                }
                aria-label="Select chart currency"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            )}
          </div>

          {trendsLoading ? (
            <div className="chart-placeholder">
              Loading financial activity...
            </div>
          ) : trendsError ? (
            <div className="chart-placeholder">
              <p className="auth-error">{trendsError}</p>
            </div>
          ) : !hasFinancialActivity ? (
            <div className="chart-placeholder">
              <ChartNoAxesCombined size={36} />
              <strong>No financial activity</strong>
              <span>
                No sales or expenses recorded for {activeCurrency}
                {" "}in the last seven days.
              </span>
            </div>
          ) : (
            <div style={{ width: "100%", height: 300, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tickFormatter={formatCompactAmount}
                    tick={{ fontSize: 12 }}
                    width={55}
                  />

                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(
                        Number(value ?? 0),
                        activeCurrency
                      ),
                      String(name),
                    ]}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="Revenue"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
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
            <div className="assistant-icon">
              <Bot size={21} />
            </div>

            <p>
              Hello! I'm TradePilot AI. I can help you understand
              your business performance and make better decisions.
            </p>
          </div>

          <div className="suggestion">
            How is my business performing?
          </div>

          <div className="suggestion">
            Compare this week's revenue
          </div>

          <button
            className="chat-button"
            onClick={() => navigate("/assistant")}
          >
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
        {direction &&
          (direction === "up" ? (
            <ArrowUpRight
              size={15}
              className="positive"
            />
          ) : (
            <ArrowDownRight
              size={15}
              className="negative"
            />
          ))}

        <span>{change}</span>
      </div>
    </div>
  );
}
