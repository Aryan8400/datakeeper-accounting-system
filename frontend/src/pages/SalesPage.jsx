import { useState, useMemo } from "react";
import { useData } from "../hooks/useData.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Button from "../components/ui/Button.jsx";
import Alert from "../components/ui/Alert.jsx";
import { calcDueAmount, calcSaleTotal } from "../utils/calculations.js";
import { formatCurrency } from "../utils/formatters.js";

export default function SalesPage() {
  const { materials, addSale } = useData();
  const [form, setForm] = useState({
    customerName: "",
    materialId: "",
    quantityKg: "",
    ratePerKg: "",
    paidAmount: "",
  });
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedMaterial = materials.find((m) => m.id === form.materialId);

  const totalAmount = useMemo(
    () => calcSaleTotal(form.quantityKg, form.ratePerKg),
    [form.quantityKg, form.ratePerKg]
  );

  const dueAmount = useMemo(
    () => calcDueAmount(totalAmount, form.paidAmount),
    [totalAmount, form.paidAmount]
  );

  function handleMaterialChange(e) {
    const id = e.target.value;
    const mat = materials.find((m) => m.id === id);
    setForm((f) => ({
      ...f,
      materialId: id,
      ratePerKg: mat && !useCustomRate ? String(mat.sellingPrice) : f.ratePerKg,
    }));
  }

  function resetForm() {
    setForm({
      customerName: "",
      materialId: "",
      quantityKg: "",
      ratePerKg: "",
      paidAmount: "",
    });
    setUseCustomRate(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      addSale(form);
      setSuccess("Sale recorded successfully! Stock has been updated.");
      resetForm();
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
        subtitle="Record Jasta Patta sales — quantity × rate = total, with partial payment support"
      />

      <div className="mx-auto max-w-2xl">
        {materials.length === 0 && (
          <Alert variant="warning" className="mb-6">
            Add materials in Stock Management before recording sales.
          </Alert>
        )}

        {success && <Alert variant="success" className="mb-4">{success}</Alert>}
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="card space-y-5">
          <Input
            label="Customer Name"
            id="customerName"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Customer / company name"
            required
          />

          <Select
            label="Material"
            id="materialId"
            value={form.materialId}
            onChange={handleMaterialChange}
            required
          >
            <option value="">Select material</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.stockKg} KG available
              </option>
            ))}
          </Select>

          {selectedMaterial && (
            <p className="-mt-3 text-xs text-slate-500">
              Default rate: {formatCurrency(selectedMaterial.sellingPrice)}/KG · Stock: {selectedMaterial.stockKg} KG
            </p>
          )}

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={useCustomRate}
              onChange={(e) => {
                setUseCustomRate(e.target.checked);
                if (!e.target.checked && selectedMaterial) {
                  setForm((f) => ({ ...f, ratePerKg: String(selectedMaterial.sellingPrice) }));
                }
              }}
              className="rounded border-slate-300 text-brand-600"
            />
            Use custom rate per KG
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Quantity (KG)"
              id="quantityKg"
              type="number"
              min="0.01"
              step="0.01"
              value={form.quantityKg}
              onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
              placeholder="e.g. 200"
              required
            />
            <Input
              label="Rate per KG (Rs.)"
              id="ratePerKg"
              type="number"
              min="0"
              step="0.01"
              value={form.ratePerKg}
              onChange={(e) => setForm({ ...form, ratePerKg: e.target.value })}
              disabled={!useCustomRate && !!selectedMaterial}
              placeholder="155"
              required
            />
          </div>

          {/* Live calculation preview — e.g. 200 × 155 = 31,000 */}
          <div className="rounded-xl bg-brand-50 p-4 dark:bg-brand-950/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Calculation
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {form.quantityKg || 0} KG × {formatCurrency(Number(form.ratePerKg) || 0)} ={" "}
              <span className="text-brand-600 dark:text-brand-400">{formatCurrency(totalAmount)}</span>
            </p>
          </div>

          <Input
            label="Paid Amount (Rs.)"
            id="paidAmount"
            type="number"
            min="0"
            step="0.01"
            value={form.paidAmount}
            onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
            placeholder="Partial or full payment"
          />

          <div className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Total Amount</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Due Amount</p>
              <p className={`text-lg font-bold ${dueAmount > 0 ? "text-amber-600" : "text-brand-600"}`}>
                {formatCurrency(dueAmount)}
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || materials.length === 0}>
            {loading ? "Saving…" : "Record Sale"}
          </Button>
        </form>
      </div>
    </div>
  );
}
