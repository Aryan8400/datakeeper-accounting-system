import { useState, useMemo } from "react";
import { useData } from "../hooks/useData.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Alert from "../components/ui/Alert.jsx";
import Modal from "../components/ui/Modal.jsx";
import { calcDueAmount, calcSaleTotal } from "../utils/calculations.js";
import { formatCurrency, formatDateTime } from "../utils/formatters.js";

const emptyLineItem = {
  materialId: "",
  materialName: "",
  quantityKg: "",
  ratePerKg: "",
};

export default function SalesPage() {
  const { materials, sales, addMultipleSales, updateSale, deleteSale } =
    useData();

  const [customerName, setCustomerName] = useState("");
  const [lineItems, setLineItems] = useState([
    { ...emptyLineItem, id: Date.now() },
  ]);
  const [paidAmount, setPaidAmount] = useState("");
  const [useCustomRates, setUseCustomRates] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  // Calculate totals
  const lineItemsWithTotals = useMemo(() => {
    return lineItems.map((item) => ({
      ...item,
      subtotal: calcSaleTotal(item.quantityKg, item.ratePerKg),
    }));
  }, [lineItems]);

  const grandTotal = useMemo(() => {
    return lineItemsWithTotals.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
  }, [lineItemsWithTotals]);

  const dueAmount = useMemo(() => {
    return calcDueAmount(grandTotal, paidAmount);
  }, [grandTotal, paidAmount]);

  function addLineItem() {
    setLineItems([
      ...lineItems,
      { ...emptyLineItem, id: Date.now() + Math.random() },
    ]);
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
    const material = materials.find((m) => m.id === materialId);

    updateLineItem(id, "materialId", materialId);
    updateLineItem(id, "materialName", material?.name || "");

    if (material && !useCustomRates[id]) {
      updateLineItem(id, "ratePerKg", String(material.sellingPrice));
    }
  }

  function resetForm() {
    setCustomerName("");
    setLineItems([{ ...emptyLineItem, id: Date.now() }]);
    setPaidAmount("");
    setUseCustomRates({});
    setEditingSale(null);
    setError("");
  }

  function openEditSale(sale) {
    setEditingSale(sale);

    setCustomerName(sale.customerName);

    setLineItems([
      {
        id: sale.id,
        materialId: sale.materialId,
        materialName: sale.materialName,
        quantityKg: String(sale.quantityKg),
        ratePerKg: String(sale.ratePerKg),
      },
    ]);

    setPaidAmount(String(sale.paidAmount || 0));
    setUseCustomRates({ [sale.id]: true });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    const hasInvalidItem = lineItems.some(
      (item) =>
        !item.materialId || !item.quantityKg || !item.ratePerKg
    );

    if (hasInvalidItem) {
      setError(
        "All line items must have material, quantity and rate."
      );
      return;
    }

    setLoading(true);

    try {
      if (editingSale) {
        const item = lineItems[0];

        await updateSale(editingSale.id, {
          customerName,
          materialId: item.materialId,
          quantityKg: Number(item.quantityKg),
          ratePerKg: Number(item.ratePerKg),
          paidAmount: Number(paidAmount) || 0,
        });

        setSuccess("Sale updated successfully.");
      } else {
        const salesData = lineItems.map((item) => {
          return {
            customerName,
            materialId: item.materialId,
            materialName: item.materialName,
            quantityKg: Number(item.quantityKg),
            ratePerKg: Number(item.ratePerKg),
          };
        });

        await addMultipleSales(
          salesData,
          Number(paidAmount) || 0
        );

        setSuccess(
          `Sale recorded successfully! ${lineItems.length} item${
            lineItems.length > 1 ? "s" : ""
          } added.`
        );
      }

      resetForm();
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sales Entry"
        subtitle="Record customer sales with multiple items"
      />

      <div className="mx-auto max-w-4xl">
        {materials.length === 0 && (
          <Alert variant="warning" className="mb-6">
            Add materials before recording sales.
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit}
          className="card space-y-6"
        >
          <Input
            label="Customer Name"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer / Company Name"
            required
          />

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Items
              </h3>

              <span className="text-xs text-slate-500">
                {lineItems.length} item
                {lineItems.length > 1 ? "s" : ""}
              </span>
            </div>

            {lineItemsWithTotals.map((item) => {
              const selectedMaterial = materials.find(
                (m) => m.id === item.materialId
              );

              return (
                <div
                  key={item.id}
                  className="space-y-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Material */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Material
                      </label>

                      <select
                        value={item.materialId}
                        onChange={(e) =>
                          handleMaterialChange(
                            item.id,
                            e.target.value
                          )
                        }
                        className="input"
                        required
                      >
                        <option value="">
                          Select material
                        </option>

                        {materials.map((material) => (
                          <option
                            key={material.id}
                            value={material.id}
                          >
                            {material.name} —{" "}
                            {material.stockKg} KG
                          </option>
                        ))}
                      </select>

                      {selectedMaterial && (
                        <div className="mt-2 rounded bg-brand-50 p-2 dark:bg-brand-950/30">
                          <p className="text-xs font-medium text-brand-700 dark:text-brand-300">
                            ✓ {selectedMaterial.name}
                          </p>
                          <p className="text-xs text-brand-600 dark:text-brand-400">
                            Available: {selectedMaterial.stockKg} KG
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Quantity (KG)
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantityKg}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            "quantityKg",
                            e.target.value
                          )
                        }
                        className="input"
                        placeholder="e.g. 200"
                        required
                      />
                    </div>

                    {/* Rate */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Rate / KG (Rs.)
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.ratePerKg}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              "ratePerKg",
                              e.target.value
                            )
                          }
                          disabled={
                            !useCustomRates[item.id] &&
                            !!selectedMaterial
                          }
                          className="input flex-1"
                          required
                        />

                        {selectedMaterial && (
                          <button
                            type="button"
                            onClick={() => {
                              setUseCustomRates((prev) => ({
                                ...prev,
                                [item.id]:
                                  !prev[item.id],
                              }));

                              if (useCustomRates[item.id]) {
                                updateLineItem(
                                  item.id,
                                  "ratePerKg",
                                  String(
                                    selectedMaterial.sellingPrice
                                  )
                                );
                              }
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                          >
                            {useCustomRates[item.id]
                              ? "Custom"
                              : "Default"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex items-end justify-between">
                    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                      <p className="text-xs text-slate-500">
                        Subtotal
                      </p>

                      <p className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>

                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeLineItem(item.id)
                        }
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        Remove
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

          {/* Paid Amount */}
          <Input
            label="Paid Amount (Rs.)"
            id="paidAmount"
            type="number"
            min="0"
            step="0.01"
            value={paidAmount}
            onChange={(e) =>
              setPaidAmount(e.target.value)
            }
            placeholder="Partial or Full Payment"
          />

          {/* Summary */}
          <div className="space-y-3 rounded-xl bg-brand-50 p-4 dark:bg-brand-950/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Invoice Summary
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-brand-600 dark:text-brand-400">
                  Grand Total
                </p>

                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(grandTotal)}
                </p>
              </div>

              <div>
                <p className="text-xs text-brand-600 dark:text-brand-400">
                  Paid
                </p>

                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(
                    Number(paidAmount) || 0
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-brand-600 dark:text-brand-400">
                  Due Amount
                </p>

                <p
                  className={`text-2xl font-bold ${
                    dueAmount > 0
                      ? "text-amber-600"
                      : "text-brand-600"
                  }`}
                >
                  {formatCurrency(dueAmount)}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading || materials.length === 0
            }
          >
            {loading
              ? "Saving..."
              : editingSale
              ? "Update Sale"
              : "Record Sale"}
          </Button>
        </form>
      </div>

      {/* Sales History */}
      {sales.length > 0 && (
        <div className="mt-6 card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Sales History
            </h3>

            <span className="text-sm text-slate-500">
              {sales.length} transactions
            </span>
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
                  <th className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="whitespace-nowrap text-slate-500">
                      {formatDateTime(
                        sale.createdAt
                      )}
                    </td>

                    <td className="font-medium">
                      {sale.customerName}
                    </td>

                    <td>{sale.materialName}</td>

                    <td>
                      {sale.quantityKg} KG
                    </td>

                    <td>
                      {formatCurrency(
                        sale.totalAmount
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        sale.paidAmount
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        sale.dueAmount
                      )}
                    </td>

                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() =>
                          openEditSale(sale)
                        }
                        className="mr-2 rounded-lg p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              "Delete this sale?"
                            )
                          ) {
                            return;
                          }

                          try {
                            await deleteSale(
                              sale.id
                            );

                            setSuccess(
                              "Sale deleted successfully."
                            );
                          } catch (err) {
                            setError(
                              err.message
                            );
                          }
                        }}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="Edit Sale"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <Input
            label="Customer Name"
            id="editCustomerName"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Update Sale"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}