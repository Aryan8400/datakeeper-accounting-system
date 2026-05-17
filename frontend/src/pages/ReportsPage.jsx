import { useState, useMemo } from "react";
import { useData } from "../hooks/useData.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import DailySalesChart from "../components/charts/DailySalesChart.jsx";
import MonthlyRevenueChart from "../components/charts/MonthlyRevenueChart.jsx";
import { filterSalesByPeriod, groupSalesByDay, groupSalesByMonth } from "../utils/dateFilters.js";
import { formatCurrency, formatDateTime, formatNumber } from "../utils/formatters.js";
import { calcProfit } from "../utils/calculations.js";

const PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

export default function ReportsPage() {
  const { sales, materials } = useData();
  const [period, setPeriod] = useState("monthly");

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
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
