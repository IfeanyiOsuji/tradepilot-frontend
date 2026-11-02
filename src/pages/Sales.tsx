
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plus, Receipt, RefreshCw } from "lucide-react";
import {
  authApi,
  type CreateSaleRequest,
  type SaleResponse,
  type SaleType,
  type InventoryItem,
} from "../services/api";

type SaleMode = "STANDALONE" | "INVENTORY";

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

function initialForm(): CreateSaleRequest {
  return {
    itemName: "",
    saleType: "PRODUCT",
    quantity: 1,
    unitPrice: 0,
    currency: "NGN",
    soldAt: getLocalDateTime(),
  };
}

export default function Sales() {
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [mode, setMode] = useState<SaleMode>("STANDALONE");
  const [selectedInventoryId, setSelectedInventoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<CreateSaleRequest>(initialForm);

  const selectedProduct = inventory.find(
    (item) => item.id === Number(selectedInventoryId)
  );

  async function loadSales() {
    setLoading(true);

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

  async function loadInventory() {
    setInventoryLoading(true);

    try {
      const data = await authApi.getInventoryItems();
      setInventory(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load inventory."
      );
    } finally {
      setInventoryLoading(false);
    }
  }

  useEffect(() => {
    void loadSales();
    void loadInventory();
  }, []);

  function changeMode(nextMode: SaleMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setSelectedInventoryId("");
    setForm(initialForm());
  }

  function selectInventoryProduct(id: string) {
    setSelectedInventoryId(id);

    const product = inventory.find((item) => item.id === Number(id));

    if (product) {
      setForm((current) => ({
        ...current,
        itemName: product.productName,
        saleType: "PRODUCT",
        unitPrice: product.sellingPrice,
        currency: product.currency,
      }));
    } else {
      setForm((current) => ({
        ...current,
        itemName: "",
        unitPrice: 0,
        currency: "NGN",
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    if (!form.soldAt || !Number.isFinite(form.quantity) ||
        form.quantity <= 0 || !Number.isFinite(form.unitPrice) ||
        form.unitPrice < 0) {
      setError("Enter a valid date, positive quantity, and non-negative price.");
      return;
    }

    if (mode === "INVENTORY") {
      if (!selectedProduct) {
        setError("Please select an inventory product.");
        return;
      }

      if (form.quantity > selectedProduct.quantityInStock) {
        setError(
          `Insufficient stock. Only ${selectedProduct.quantityInStock} units available.`
        );
        return;
      }
    } else if (!form.itemName.trim()) {
      setError("Enter a product or service name.");
      return;
    }

    setSaving(true);

    try {
      // LocalDateTime expects a timezone-free local date-time.
      const soldAt = form.soldAt.length === 16
        ? `${form.soldAt}:00`
        : form.soldAt;

      if (mode === "INVENTORY" && selectedProduct) {
        await authApi.recordInventorySale({
          inventoryItemId: selectedProduct.id,
          quantity: form.quantity,
          unitPrice: form.unitPrice,
          soldAt,
        });

        setSuccess(
          `Inventory sale recorded! ${form.quantity} units of ${selectedProduct.productName} sold.`
        );

        setSelectedInventoryId("");
      } else {
        await authApi.createSale({
          ...form,
          itemName: form.itemName.trim(),
          currency: form.currency.toUpperCase(),
          soldAt,
        });

        setSuccess("Sale recorded successfully!");
      }

      setForm(initialForm());

      // Refresh both sales and stock after a successful transaction.
      await Promise.all([loadSales(), loadInventory()]);
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

        <button
          type="button"
          onClick={() => {
            setError("");
            void Promise.all([loadSales(), loadInventory()]);
          }}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className="sales-form-card">
        <h2>
          <Plus size={20} />
          Record a Sale
        </h2>

        <div className="sales-mode-selector">
          <button
            type="button"
            className={mode === "STANDALONE" ? "active" : ""}
            onClick={() => changeMode("STANDALONE")}
          >
            Standalone Sale
          </button>

          <button
            type="button"
            className={mode === "INVENTORY" ? "active" : ""}
            onClick={() => changeMode("INVENTORY")}
          >
            Sell from Inventory
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sales-form">
          {mode === "INVENTORY" ? (
            <>
              <div className="sales-field">
                <label htmlFor="inventoryProduct">Inventory product</label>

                <select
                  id="inventoryProduct"
                  value={selectedInventoryId}
                  onChange={(event) =>
                    selectInventoryProduct(event.target.value)
                  }
                  required
                >
                  <option value="">
                    {inventoryLoading
                      ? "Loading products..."
                      : "Select a product"}
                  </option>

                  {inventory.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                      disabled={product.quantityInStock <= 0}
                    >
                      {product.productName} — {product.sku}
                      {" "}({product.quantityInStock} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sales-field">
                <label>Available stock</label>
                <input
                  value={selectedProduct?.quantityInStock ?? ""}
                  readOnly
                  placeholder="Select a product"
                />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

          <div className="sales-field">
            <label htmlFor="saleQuantity">Quantity</label>

            <input
              id="saleQuantity"
              type="number"
              min="0.0001"
              step="any"
              max={
                mode === "INVENTORY"
                  ? selectedProduct?.quantityInStock
                  : undefined
              }
              value={form.quantity}
              onChange={(event) =>
                setForm({
                  ...form,
                  quantity: Number(event.target.value),
                })
              }
              required
            />
          </div>

          <div className="sales-field">
            <label htmlFor="salePrice">Unit price</label>

            <input
              id="salePrice"
              type="number"
              min="0"
              step="any"
              value={form.unitPrice}
              onChange={(event) =>
                setForm({
                  ...form,
                  unitPrice: Number(event.target.value),
                })
              }
              required
            />
          </div>

          <div className="sales-field">
            <label htmlFor="saleCurrency">Currency</label>

            <select
              id="saleCurrency"
              value={form.currency}
              disabled={mode === "INVENTORY"}
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

          <button
            className="sales-submit"
            type="submit"
            disabled={saving || (mode === "INVENTORY" && !selectedProduct)}
          >
            <Plus size={18} />
            {saving ? "Recording sale..." : "Record Sale"}
          </button>
        </form>
      </section>

      <section className="sales-history">
        <div className="sales-history-heading">
          <h2>
            <Receipt size={20} />
            Sales History
          </h2>

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
