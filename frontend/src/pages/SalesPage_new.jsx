import { useState, useMemo } from "react";
import { useData } from "../hooks/useData.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Button from "../components/ui/Button.jsx";
import Alert from "../components/ui/Alert.jsx";
import Modal from "../components/ui/Modal.jsx";
import { calcDueAmount, calcSaleTotal } from "../utils/calculations.js";
import { formatCurrency, formatDateTime } from "../utils/formatters.js";

const emptyLineItem = {
  materialId: "",
  quantityKg: "",
  ratePerKg: "",
};

export default function SalesPage() {
  const { materials, sales, addMultipleSales, updateSale, deleteSale } = useData();
  const [customerName, setCustomerName] = useState("");
  const [lineItems, setLineItems] = useState([{ ...emptyLineItem, id: Date.now() }]);
  const [paidAmount, setPaidAmount] = useState("");
  const [useCustomRates, setUseCustomRates] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  // Calculate totals for all line items
  const lineItemsWithTotals = useMemo(() => {
    return lineItems.map((item) => ({
      ...item,
      subtotal: calcSaleTotal(item.quantityKg, item.ratePerKg),
    }));
  }, [lineItems]);

  const grandTotal = useMemo(
    () => lineItemsWithTotals.reduce((sum, item) => sum + item.subtotal, 0),
    [lineItemsWithTotals]
  );

  const dueAmount = useMemo(
    () => calcDueAmount(grandTotal, paidAmount),
    [grandTotal, paidAmount]
  );

  function addLineItem() {
    setLineItems([...lineItems, { ...emptyLineItem, id: Date.now() }]);
  }

  function removeLineItem(id) {
    if (lineItems.length === 1) {
      setError("At least one line item is required.");
      return;
    }
    setLineItems(lineItems.filter((item) => item.id !== id));
  }

  function updateLineItem(id, field, value) {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }

  function handleMaterialChange(id, materialId) {
    const selectedId = materialId === "" ? "" : materialId;
    const mat = materials.find((m) => String(m.id) === String(selectedId));
    setLineItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              materialId: selectedId,
              materialName: mat?.name || "",
              ratePerKg:
                mat && !useCustomRates[id]
                  ? String(mat.sellingPrice)
                  : item.ratePerKg,
            }
          : item
      )
    );
  }

  function resetForm() {
    setCustomerName("");
    setLineItems([{ ...emptyLineItem, id: Date.now() }]);
    setPaidAmount("");
    setUseCustomRates({});
    setEditingSale(null);
  }

  function openEditSale(sale) {
    setEditingSale(sale);
    setCustomerName(sale.customerName);
    setLineItems([
      {
        id: sale.id,
        materialId: sale.materialId,
        quantityKg: String(sale.quantityKg),
        ratePerKg: String(sale.ratePerKg),
      },
    ]);
    setPaidAmount(String(sale.paidAmount));
    setUseCustomRates({ [sale.id]: true });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (lineItems.some((item) => !item.materialId || !item.quantityKg || !item.ratePerKg)) {
      setError("All line items must have material, quantity, and rate.");
      return;
    }

    if (Number(paidAmount) > grandTotal) {
      setError("Paid amount cannot exceed total sale amount.");
      return;
    }

    setLoading(true);
    try {
      if (editingSale) {
        // Edit mode: update single sale
        const item = lineItems[0];
        await updateSale(editingSale.id, {
          customerName,
          materialId: item.materialId,
          quantityKg: item.quantityKg,
          ratePerKg: item.ratePerKg,
          paidAmount,
        });
        setSuccess("Sale updated successfully.");
      } else {
        // Add mode: create multiple sales if multiple items
        const salesData = lineItems.map((item) => {
          const mat = materials.find((m) => String(m.id) === String(item.materialId));
          return {
            customerName,
            materialId: item.materialId,
            materialName: mat?.name || item.materialName || "",
            quantityKg: Number(item.quantityKg),
            ratePerKg: Number(item.ratePerKg),
          };
        });

        await addMultipleSales(salesData, Number(paidAmount) || 0);
        setSuccess(
          `Sale recorded successfully! ${lineItems.length} item${lineItems.length > 1 ? "s" : ""} added. Stock has been updated.`
        );
      }
      resetForm();
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sales Entry"
        subtitle="Record sales with multiple items per customer — each customer can buy various materials"
      />

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-0">
        {materials.length === 0 && (
          <Alert variant="warning" className="mb-6">
            Add materials in Stock Management before recording sales.
          </Alert>
        )}

        {success && <Alert variant="success" className="mb-4">{success}</Alert>}
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Customer Name */}
          <div>
            <Input
              label="Customer Name"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer / company name"
              required
            />
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Items</h3>
              <span className="text-xs text-slate-500">{lineItems.length} item{lineItems.length > 1 ? "s" : ""}</span>
            </div>

            {lineItems.map((item) => {
              const selectedMaterial = materials.find((m) => m.id === item.materialId);
              return (
                <div
                  key={item.id}
                  className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Material
                      </label>
                      <select
                        value={item.materialId}
                        onChange={(e) => handleMaterialChange(item.id, e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Select material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} — {m.stockKg} KG
                          </option>
                        ))}
                      </select>
                      {selectedMaterial && (
                        <p className="mt-1 text-xs text-slate-500">
                          Available: {selectedMaterial.stockKg} KG
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Quantity (KG)
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantityKg}
                        onChange={(e) => updateLineItem(item.id, "quantityKg", e.target.value)}
                        placeholder="e.g. 200"
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Rate/KG (Rs.)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.ratePerKg}
                          onChange={(e) => updateLineItem(item.id, "ratePerKg", e.target.value)}
                          disabled={!useCustomRates[item.id] && !!selectedMaterial}
                          placeholder={selectedMaterial?.sellingPrice || "155"}
                          className="input flex-1"
                          required
                        />
                        {selectedMaterial && (
                          <button
                            type="button"
                            onClick={() => {
                              setUseCustomRates((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }));
                              if (useCustomRates[item.id]) {
                                updateLineItem(item.id, "ratePerKg", String(selectedMaterial.sellingPrice));
                              }
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                            title={useCustomRates[item.id] ? "Use default rate" : "Use custom rate"}
                          >
                            {useCustomRates[item.id] ? "Custom" : "Default"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                      <p className="text-xs text-slate-500">Subtotal</p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(lineItems.find(i => i.id === item.id)?.subtotal || 0)}
                      </p>
                    </div>

                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Remove item"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              onClick={addLineItem}
              className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              + Add Item
            </Button>
          </div>

          {/* Payment Section */}
          <Input
            label="Paid Amount (Rs.)"
            id="paidAmount"
            type="number"
            min="0"
            step="0.01"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="Partial or full payment"
          />

          {/* Totals */}
          <div className="rounded-xl bg-brand-50 p-4 dark:bg-brand-950/30 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Invoice Summary
            </p>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div>
                <p className="text-xs text-brand-600 dark:text-brand-400">Grand Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(grandTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-600 dark:text-brand-400">Paid</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(Number(paidAmount) || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-brand-600 dark:text-brand-400">Due Amount</p>
                <p className={`text-2xl font-bold ${dueAmount > 0 ? "text-amber-600" : "text-brand-600"}`}>
                  {formatCurrency(dueAmount)}
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || materials.length === 0}>
            {loading ? "Saving…" : editingSale ? "Update Sale" : "Record Sale"}
          </Button>
        </form>
      </div>

      {sales.length > 0 && (
        <div className="mt-6 card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Sales History</h3>
            <span className="text-sm text-slate-500">{sales.length} transactions</span>
          </div>
          <div className="table-wrap border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Material</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="whitespace-nowrap text-slate-500">{formatDateTime(sale.createdAt)}</td>
                    <td className="font-medium">{sale.customerName}</td>
                    <td>{sale.materialName}</td>
                    <td>{sale.quantityKg} KG</td>
                    <td>{formatCurrency(sale.totalAmount)}</td>
                    <td>{formatCurrency(sale.paidAmount)}</td>
                    <td>{formatCurrency(sale.dueAmount)}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        title="Edit sale"
                        onClick={() => openEditSale(sale)}
                        className="mr-2 rounded-lg p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950"
                        aria-label="Edit sale"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Delete sale"
                        onClick={async () => {
                          if (!window.confirm("Delete this sale? Stock will be restored.")) return;
                          try {
                            setError("");
                            await deleteSale(sale.id);
                            setSuccess("Sale deleted and stock restored.");
                          } catch (err) {
                            setError(err.message);
                          }
                        }}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        aria-label="Delete sale"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingSale ? "Edit Sale" : "New Sale"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Input
            label="Customer Name"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer / company name"
            required
          />

          {editingSale && (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              {lineItems.map((item) => {
                const selectedMaterial = materials.find((m) => m.id === item.materialId);
                return (
                  <div key={item.id} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Material
                      </label>
                      <select
                        value={item.materialId}
                        onChange={(e) => handleMaterialChange(item.id, e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Select material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} — {m.stockKg} KG
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Quantity (KG)
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantityKg}
                          onChange={(e) => updateLineItem(item.id, "quantityKg", e.target.value)}
                          className="input"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Rate/KG (Rs.)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.ratePerKg}
                          onChange={(e) => updateLineItem(item.id, "ratePerKg", e.target.value)}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Input
            label="Paid Amount (Rs.)"
            id="paidAmount"
            type="number"
            min="0"
            step="0.01"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="Partial or full payment"
          />

          <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Total Amount</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(grandTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Due Amount</p>
              <p className={`text-lg font-bold ${dueAmount > 0 ? "text-amber-600" : "text-brand-600"}`}>
                {formatCurrency(dueAmount)}
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : editingSale ? "Update Sale" : "Record Sale"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
