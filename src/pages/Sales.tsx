
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plus, Receipt, RefreshCw } from "lucide-react";
import {
  authApi,
  type CreateSaleRequest,
  type SaleResponse,
  type SaleType,
} from "../services/api";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
}

function getLocalDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export default function Sales() {
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<CreateSaleRequest>({
    itemName: "",
    saleType: "PRODUCT",
    quantity: 1,
    unitPrice: 0,
    currency: "NGN",
    soldAt: getLocalDateTime(),
  });

  async function loadSales() {
    setLoading(true);
    setError("");

    try {
      const data = await authApi.getSales();
      setSales(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load sales."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSales();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.itemName.trim() || form.quantity <= 0 || form.unitPrice <= 0) {
      setError("Enter an item name, positive quantity, and positive unit price.");
      return;
    }

    setSaving(true);

    try {
      await authApi.createSale({
        ...form,
        itemName: form.itemName.trim(),
        currency: form.currency.toUpperCase(),
        soldAt: new Date(form.soldAt).toISOString(),
      });

      setSuccess("Sale recorded successfully!");

      setForm({
        itemName: "",
        saleType: "PRODUCT",
        quantity: 1,
        unitPrice: 0,
        currency: "NGN",
        soldAt: getLocalDateTime(),
      });

      await loadSales();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record sale."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="sales-page">
      <div className="sales-heading">
        <div>
          <h1>Sales Management</h1>
          <p>Record sales and track your business transactions.</p>
        </div>
        <button type="button" onClick={() => void loadSales()}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className="sales-form-card">
        <h2><Plus size={20} /> Record a Sale</h2>

        <form onSubmit={handleSubmit} className="sales-form">
          <div className="sales-field">
            <label htmlFor="saleName">Product or service name</label>
            <input
              id="saleName"
              value={form.itemName}
              onChange={(event) =>
                setForm({ ...form, itemName: event.target.value })
              }
              placeholder="e.g. Bag of rice"
              required
            />
          </div>

          <div className="sales-field">
            <label htmlFor="saleType">Sale type</label>
            <select
              id="saleType"
              value={form.saleType}
              onChange={(event) =>
                setForm({
                  ...form,
                  saleType: event.target.value as SaleType,
                })
              }
            >
              <option value="PRODUCT">Product</option>
              <option value="SERVICE">Service</option>
            </select>
          </div>

          <div className="sales-field">
            <label htmlFor="saleQuantity">Quantity</label>
            <input
              id="saleQuantity"
              type="number"
              min="0.0001"
              step="any"
              value={form.quantity}
              onChange={(event) =>
                setForm({ ...form, quantity: Number(event.target.value) })
              }
              required
            />
          </div>

          <div className="sales-field">
            <label htmlFor="salePrice">Unit price</label>
            <input
              id="salePrice"
              type="number"
              min="0.01"
              step="any"
              value={form.unitPrice}
              onChange={(event) =>
                setForm({ ...form, unitPrice: Number(event.target.value) })
              }
              required
            />
          </div>

          <div className="sales-field">
            <label htmlFor="saleCurrency">Currency</label>
            <select
              id="saleCurrency"
              value={form.currency}
              onChange={(event) =>
                setForm({ ...form, currency: event.target.value })
              }
            >
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>

          <div className="sales-field">
            <label htmlFor="soldAt">Date and time</label>
            <input
              id="soldAt"
              type="datetime-local"
              value={form.soldAt}
              onChange={(event) =>
                setForm({ ...form, soldAt: event.target.value })
              }
              required
            />
          </div>

          <div className="sales-total">
            <span>Sale total</span>
            <strong>
              {formatMoney(
                form.quantity * form.unitPrice,
                form.currency
              )}
            </strong>
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="sales-success">{success}</p>}

          <button className="sales-submit" type="submit" disabled={saving}>
            <Plus size={18} />
            {saving ? "Recording sale..." : "Record Sale"}
          </button>
        </form>
      </section>

      <section className="sales-history">
        <div className="sales-history-heading">
          <h2><Receipt size={20} /> Sales History</h2>
          <span>{sales.length} transactions</span>
        </div>

        {loading ? (
          <p>Loading sales...</p>
        ) : sales.length === 0 ? (
          <p>No sales recorded yet.</p>
        ) : (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Unit price</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.itemName}</td>
                    <td>{sale.saleType}</td>
                    <td>{sale.quantity}</td>
                    <td>{formatMoney(sale.unitPrice, sale.currency)}</td>
                    <td>
                      <strong>
                        {formatMoney(sale.totalAmount, sale.currency)}
                      </strong>
                    </td>
                    <td>{new Date(sale.soldAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
