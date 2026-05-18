import { useState, useMemo } from "react";
import { useData } from "../hooks/useData.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import DailySalesChart from "../components/charts/DailySalesChart.jsx";
import MonthlyRevenueChart from "../components/charts/MonthlyRevenueChart.jsx";
import Modal from "../components/ui/Modal.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Button from "../components/ui/Button.jsx";
import Alert from "../components/ui/Alert.jsx";
import { filterSalesByPeriod, groupSalesByDay, groupSalesByMonth } from "../utils/dateFilters.js";
import { formatCurrency, formatDateTime, formatNumber } from "../utils/formatters.js";
import { calcProfit } from "../utils/calculations.js";

const emptySaleForm = {
  customerName: "",
  materialId: "",
  quantityKg: "",
  ratePerKg: "",
  paidAmount: "",
};

const PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

export default function ReportsPage() {
  const { sales, materials, updateSale, deleteSale } = useData();
  const [period, setPeriod] = useState("monthly");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [form, setForm] = useState(emptySaleForm);
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedMaterial = materials.find((m) => m.id === form.materialId);

  const filtered = useMemo(() => filterSalesByPeriod(sales, period), [sales, period]);

  const stats = useMemo(() => {
    const revenue = filtered.reduce((s, x) => s + x.totalAmount, 0);
    const due = filtered.reduce((s, x) => s + x.dueAmount, 0);
    const qty = filtered.reduce((s, x) => s + x.quantityKg, 0);
    const profit = filtered.reduce((s, sale) => {
      const mat = materials.find((m) => m.id === sale.materialId);
      return s + calcProfit(sale.quantityKg, sale.ratePerKg, mat?.purchasePrice ?? 0);
    }, 0);
    return { count: filtered.length, revenue, due, qty, profit };
  }, [filtered, materials]);

  const chartDaily = useMemo(() => groupSalesByDay(filtered, period === "daily" ? 7 : 7), [filtered, period]);
  const chartMonthly = useMemo(() => groupSalesByMonth(filtered, 6), [filtered]);

  const handleMaterialChange = (e) => {
    const id = e.target.value;
    const mat = materials.find((m) => m.id === id);
    setForm((f) => ({
      ...f,
      materialId: id,
      ratePerKg: mat && !useCustomRate ? String(mat.sellingPrice) : f.ratePerKg,
    }));
  };

  const resetForm = () => {
    setForm(emptySaleForm);
    setUseCustomRate(false);
    setEditingSale(null);
    setError("");
    setSuccess("");
  };

  const openEditSale = (sale) => {
    setEditingSale(sale);
    setForm({
      customerName: sale.customerName,
      materialId: sale.materialId,
      quantityKg: String(sale.quantityKg),
      ratePerKg: String(sale.ratePerKg),
      paidAmount: String(sale.paidAmount),
    });
    setUseCustomRate(true);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingSale) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await updateSale(editingSale.id, form);
      setSuccess("Sale updated successfully.");
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm("Delete this sale? Stock will be restored.")) return;
    setError("");
    setSuccess("");
    try {
      await deleteSale(saleId);
      setSuccess("Sale deleted and stock restored.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Sales analytics for Jay Durge Traders" />

      <div className="mb-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              period === p.id
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Transactions" value={stats.count} variant="blue" />
        <StatCard title="Revenue" value={formatCurrency(stats.revenue)} variant="default" />
        <StatCard title="Profit" value={formatCurrency(stats.profit)} variant="purple" />
        <StatCard title="Quantity Sold" value={`${formatNumber(stats.qty)} KG`} variant="default" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Sales Trend</h3>
          <DailySalesChart data={chartDaily} />
        </div>
        <div className="card">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
          <MonthlyRevenueChart data={chartMonthly} />
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      <div className="mt-6 card">
        <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
          {PERIODS.find((p) => p.id === period)?.label} Sales Report
        </h3>
        <div className="table-wrap border-0">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Material</th>
                <th>Qty (KG)</th>
                <th>Rate</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No sales in this period.
                  </td>
                </tr>
              ) : (
                filtered.map((sale) => (
                  <tr key={sale.id}>
                    <td className="whitespace-nowrap text-slate-500">{formatDateTime(sale.createdAt)}</td>
                    <td className="font-medium">{sale.customerName}</td>
                    <td>{sale.materialName}</td>
                    <td>{formatNumber(sale.quantityKg)}</td>
                    <td>{formatCurrency(sale.ratePerKg)}</td>
                    <td>{formatCurrency(sale.totalAmount)}</td>
                    <td>{formatCurrency(sale.paidAmount)}</td>
                    <td>
                      {sale.dueAmount > 0 ? (
                        <Badge variant="warning">{formatCurrency(sale.dueAmount)}</Badge>
                      ) : (
                        <Badge variant="success">—</Badge>
                      )}
                    </td>
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
                        onClick={() => handleDelete(sale.id)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingSale ? "Edit Sale" : "Edit Sale"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Input
            label="Customer Name"
            id="reportCustomerName"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Customer / company name"
            required
          />
          <Select
            label="Material"
            id="reportMaterialId"
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
              id="reportQuantityKg"
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
              id="reportRatePerKg"
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
          <Input
            label="Paid Amount (Rs.)"
            id="reportPaidAmount"
            type="number"
            min="0"
            step="0.01"
            value={form.paidAmount}
            onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
            placeholder="Partial or full payment"
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving…" : "Update Sale"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => {
              setModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
