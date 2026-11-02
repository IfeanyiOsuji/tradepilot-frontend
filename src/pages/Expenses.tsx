
import { useCallback, useEffect, useState } from "react";
import { Plus, Receipt, RefreshCw } from "lucide-react";
import {
  authApi,
  type ExpenseRequest,
  type ExpenseResponse,
} from "../services/api";

const initialForm = (): ExpenseRequest => ({
  description: "",
  category: "OPERATIONS",
  amount: 0,
  currency: "NGN",
  incurredAt: toLocalDateTimeInput(new Date()),
});

function toLocalDateTimeInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [form, setForm] = useState<ExpenseRequest>(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await authApi.getExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load expenses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await authApi.createExpense({
        ...form,
        description: form.description.trim(),
        category: form.category.trim(),
        currency: form.currency.toUpperCase(),
        incurredAt: form.incurredAt + ":00",
      });

      setSuccess("Expense recorded successfully!");
      setForm(initialForm());

      // Refresh separately so a GET failure does not
      // make a successful POST look like a failed save.
      try {
        const updated = await authApi.getExpenses();
        setExpenses(updated);
      } catch {
        setError("Expense saved, but history could not be refreshed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record expense.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="expenses-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow">EXPENSE MANAGEMENT</div>
          <h1>Expenses</h1>
          <p>Record business expenses and monitor your spending.</p>
        </div>
      </div>

      <section className="panel expense-form-panel">
        <div className="panel-heading">
          <div>
            <h2><Plus size={22} /> Record an Expense</h2>
            <p>Keep your business spending up to date.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="expense-form-grid">
            <label>
              Description
              <input
                required
                maxLength={150}
                placeholder="e.g. Internet subscription"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option value="OPERATIONS">Operations</option>
                <option value="TRANSPORT">Transport</option>
                <option value="UTILITIES">Utilities</option>
                <option value="RENT">Rent</option>
                <option value="SALARIES">Salaries</option>
                <option value="MARKETING">Marketing</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label>
              Amount
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />
            </label>

            <label>
              Currency
              <select
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value })
                }
              >
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </label>

            <label>
              Date and time
              <input
                required
                type="datetime-local"
                value={form.incurredAt}
                onChange={(e) =>
                  setForm({ ...form, incurredAt: e.target.value })
                }
              />
            </label>
          </div>

          {error && <p className="expense-error">{error}</p>}
          {success && <p className="expense-success">{success}</p>}

          <button
            className="primary-button expense-submit"
            type="submit"
            disabled={saving}
          >
            <Plus size={18} />
            {saving ? "Saving..." : "Record Expense"}
          </button>
        </form>
      </section>

      <section className="panel expense-history-panel">
        <div className="panel-heading">
          <div>
            <h2><Receipt size={22} /> Expense History</h2>
            <p>{expenses.length} recorded expenses</p>
          </div>

          <button
            type="button"
            className="expense-refresh"
            onClick={() => void loadExpenses()}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses recorded yet.</p>
        ) : (
          <div className="expense-table-wrap">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.description}</td>
                    <td>{expense.category}</td>
                    <td className="expense-amount">
                      {formatMoney(expense.amount, expense.currency)}
                    </td>
                    <td>
                      {new Date(expense.incurredAt).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
