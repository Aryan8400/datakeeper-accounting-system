import { useState } from "react";
import { useData } from "../hooks/useData.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";
import Alert from "../components/ui/Alert.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatCurrency, formatNumber } from "../utils/formatters.js";
import { isLowStock, stockPercent } from "../utils/calculations.js";

const emptyForm = { name: "", stockKg: "", purchasePrice: "", sellingPrice: "" };

export default function StockPage() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const lowStockCount = materials.filter((m) => isLowStock(m.stockKg, m.initialStockKg)).length;

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(material) {
    setEditing(material);
    setForm({
      name: material.name,
      stockKg: String(material.stockKg),
      purchasePrice: String(material.purchasePrice),
      sellingPrice: String(material.sellingPrice),
    });
    setError("");
    setModalOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Material name is required.");
      return;
    }
    try {
      if (editing) {
        updateMaterial(editing.id, form);
      } else {
        addMaterial(form);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this material? This cannot be undone.")) {
      return;
    }

    try {
      await deleteMaterial(id);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete material.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Stock Management"
        subtitle="Manage Jasta Patta materials — stock in KG with purchase & selling rates"
        action={
          <Button onClick={openAdd}>+ Add Material</Button>
        }
      />

      {error && !modalOpen && (
        <Alert variant="danger" className="mb-6">
          {error}
        </Alert>
      )}

      {lowStockCount > 0 && (
        <Alert variant="warning" className="mb-6">
          <strong>{lowStockCount} material(s)</strong> are below 50% of initial stock. Restock soon to avoid shortages.
        </Alert>
      )}

      {materials.length === 0 ? (
        <EmptyState
          title="No materials yet"
          description="Add your first Jasta Patta material to start tracking inventory."
          action={<Button onClick={openAdd}>Add Material</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {materials.map((m) => {
            const low = isLowStock(m.stockKg, m.initialStockKg);
            const pct = stockPercent(m.stockKg, m.initialStockKg);
            return (
              <div key={m.id} className={`card-hover ${low ? "ring-2 ring-amber-400/50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{m.name}</h3>
                    {low && <Badge variant="warning" className="mt-2">Low Stock — {pct}% left</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      title="Edit material"
                      aria-label="Edit material"
                      className="rounded-lg p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      title="Delete material"
                      aria-label="Delete material"
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Stock</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatNumber(m.stockKg)} KG</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${low ? "bg-amber-500" : "bg-brand-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Purchase: {formatCurrency(m.purchasePrice)}/KG</span>
                    <span>Sell: {formatCurrency(m.sellingPrice)}/KG</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Update Material" : "Add Material"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Input label="Material Name" id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. GI Jasta Patta 0.5mm" required />
          <Input label="Stock (KG)" id="stockKg" type="number" min="0" step="0.01" value={form.stockKg} onChange={(e) => setForm({ ...form, stockKg: e.target.value })} required />
          <Input label="Purchase Price per KG (Rs.)" id="purchasePrice" type="number" min="0" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
          <Input label="Selling Price per KG (Rs.)" id="sellingPrice" type="number" min="0" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editing ? "Update" : "Add"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
