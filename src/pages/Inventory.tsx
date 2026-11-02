
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Package,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
} from "lucide-react";

import {
  authApi,
  type InventoryRequest,
  type InventoryResponse,
} from "../services/api";

const initialForm = (): InventoryRequest => ({
  productName: "",
  sku: "",
  quantityInStock: 0,
  unitCost: 0,
  sellingPrice: 0,
  currency: "NGN",
  lowStockThreshold: 5,
  targetStockLevel: 20,
});

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export default function Inventory() {
  const [form, setForm] = useState<InventoryRequest>(initialForm);
  const [items, setItems] = useState<InventoryResponse[]>([]);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = lowStockOnly
        ? await authApi.getLowStockInventory()
        : search.trim()
          ? await authApi.searchInventory(search.trim())
          : await authApi.getInventory();

      setItems(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load inventory."
      );
    } finally {
      setLoading(false);
    }
  }, [search, lowStockOnly]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  function updateNumber(
    field: keyof InventoryRequest,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: Number(value),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.productName.trim() || !form.sku.trim()) {
      setError("Product name and SKU are required.");
      return;
    }

    if (
      form.quantityInStock < 0 ||
      form.unitCost < 0 ||
      form.sellingPrice < 0 ||
      form.lowStockThreshold < 0 ||
      form.targetStockLevel < 0
    ) {
      setError("Inventory values cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      await authApi.createInventoryItem({
        ...form,
        productName: form.productName.trim(),
        sku: form.sku.trim(),
        currency: form.currency.toUpperCase(),
      });

      setSuccess("Product added successfully!");
      setForm(initialForm());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add product."
      );
      setSaving(false);
      return;
    }

    setSaving(false);

    // Reload separately so a GET failure does not imply
    // that the product creation failed.
    await loadInventory();
  }

  return (
    <div>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">STOCK MANAGEMENT</div>
          <h1>Inventory Management</h1>
          <p>
            Add products, monitor stock levels, and plan restocking.
          </p>
        </div>
      </div>

      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-heading">
          <h2>
            <Plus size={22} /> Add Product
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="expense-form-grid">
            <label>
              Product name
              <input
                required
                maxLength={150}
                placeholder="e.g. Bag of rice"
                value={form.productName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    productName: event.target.value,
                  })
                }
              />
            </label>

            <label>
              SKU
              <input
                required
                maxLength={50}
                placeholder="e.g. RICE-001"
                value={form.sku}
                onChange={(event) =>
                  setForm({
                    ...form,
                    sku: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Quantity in stock
              <input
                type="number"
                min="0"
                step="0.0001"
                required
                value={form.quantityInStock}
                onChange={(event) =>
                  updateNumber(
                    "quantityInStock",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Unit cost
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.unitCost}
                onChange={(event) =>
                  updateNumber("unitCost", event.target.value)
                }
              />
            </label>

            <label>
              Selling price
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.sellingPrice}
                onChange={(event) =>
                  updateNumber(
                    "sellingPrice",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Currency
              <select
                value={form.currency}
                onChange={(event) =>
                  setForm({
                    ...form,
                    currency: event.target.value,
                  })
                }
              >
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </label>

            <label>
              Low-stock threshold
              <input
                type="number"
                min="0"
                step="0.0001"
                required
                value={form.lowStockThreshold}
                onChange={(event) =>
                  updateNumber(
                    "lowStockThreshold",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Target stock level
              <input
                type="number"
                min="0"
                step="0.0001"
                required
                value={form.targetStockLevel}
                onChange={(event) =>
                  updateNumber(
                    "targetStockLevel",
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          {error && (
            <p style={{ color: "#dc2626", marginTop: 16 }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ color: "#15803d", marginTop: 16 }}>
              {success}
            </p>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
            style={{ marginTop: 20 }}
          >
            <Plus size={18} />
            {saving ? "Saving..." : "Add Product"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>
              <Package size={22} /> Inventory Items
            </h2>
            <p>{items.length} products displayed</p>
          </div>

          <button
            type="button"
            onClick={() => void loadInventory()}
            disabled={loading}
          >
            <RefreshCw size={17} /> Refresh
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: 15,
              }}
            />

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{
                width: "100%",
                padding: "14px 14px 14px 44px",
                border: "1px solid #d6e0db",
                borderRadius: 10,
              }}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(event) =>
                setLowStockOnly(event.target.checked)
              }
            />
            Low stock only
          </label>
        </div>

        {loading ? (
          <p style={{ marginTop: 20 }}>Loading inventory...</p>
        ) : items.length === 0 ? (
          <p style={{ marginTop: 20 }}>
            No matching inventory items found.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Unit cost</th>
                  <th>Selling price</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const isLow =
                    item.quantityInStock <=
                    item.lowStockThreshold;

                  return (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.sku}</td>
                      <td>{item.quantityInStock}</td>
                      <td>
                        {formatMoney(
                          item.unitCost,
                          item.currency
                        )}
                      </td>
                      <td>
                        {formatMoney(
                          item.sellingPrice,
                          item.currency
                        )}
                      </td>
                      <td>
                        {isLow ? (
                          <span style={{ color: "#b45309" }}>
                            <AlertTriangle size={15} />
                            Low stock
                          </span>
                        ) : (
                          <span style={{ color: "#15803d" }}>
                            In stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
