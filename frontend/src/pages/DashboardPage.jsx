import { Link } from "react-router-dom";
import { useData } from "../hooks/useData.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Alert from "../components/ui/Alert.jsx";
import Badge from "../components/ui/Badge.jsx";
import DailySalesChart from "../components/charts/DailySalesChart.jsx";
import MonthlyRevenueChart from "../components/charts/MonthlyRevenueChart.jsx";
import StockOverviewChart from "../components/charts/StockOverviewChart.jsx";
import { formatCurrency, formatDateTime, formatNumber } from "../utils/formatters.js";
export default function DashboardPage() {
  const { stats, chartData, recentSales, materials } = useData();
  const lowStock = stats.lowStockItems;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of Jay Durge Traders — Jasta Patta business"
        action={
          <Link to="/sales" className="btn-primary">
            + New Sale
          </Link>
        }
      />

      {lowStock.length > 0 && (
        <Alert variant="warning" className="mb-6">
          <strong>Low stock alert:</strong> {lowStock.length} material(s) below 50% of initial stock.{" "}
          <Link to="/stock" className="font-semibold underline">
            View stock
          </Link>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          subtitle="All-time transactions"
          variant="blue"
          icon={<span className="text-lg">📋</span>}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`Due: ${formatCurrency(stats.totalDue)}`}
          variant="default"
          icon={<span className="text-sm font-bold">Rs</span>}
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(stats.totalProfit)}
          subtitle="Estimated margin"
          variant="purple"
          icon={<span className="text-lg">📈</span>}
        />
        <StatCard
          title="Current Stock"
          value={`${formatNumber(stats.totalStockKg)} KG`}
          subtitle={`${materials.length} materials`}
          variant="default"
          icon={<span className="text-lg">📦</span>}
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockCount}
          subtitle="Below 50% threshold"
          variant="red"
          icon={<span className="text-lg">⚠️</span>}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="card lg:col-span-1 xl:col-span-1">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Daily Sales (7 days)</h3>
          <DailySalesChart data={chartData.dailySales} />
        </div>
        <div className="card lg:col-span-1 xl:col-span-1">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Monthly Revenue</h3>
          <MonthlyRevenueChart data={chartData.monthlyRevenue} />
        </div>
        <div className="card lg:col-span-2 xl:col-span-1">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Stock Overview (KG)</h3>
          <StockOverviewChart data={chartData.stockOverview} />
        </div>
      </div>

      <div className="mt-6 card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Recent Sales</h3>
          <Link to="/reports" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            View all →
          </Link>
        </div>
        <div className="table-wrap border-0 shadow-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Material</th>
                <th>Qty (KG)</th>
                <th>Total</th>
                <th>Due</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No sales yet.{" "}
                    <Link to="/sales" className="text-brand-600 hover:underline">
                      Record a sale
                    </Link>
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="font-medium">{sale.customerName}</td>
                    <td>{sale.materialName}</td>
                    <td>{formatNumber(sale.quantityKg)}</td>
                    <td>{formatCurrency(sale.totalAmount)}</td>
                    <td>
                      {sale.dueAmount > 0 ? (
                        <Badge variant="warning">{formatCurrency(sale.dueAmount)}</Badge>
                      ) : (
                        <Badge variant="success">Paid</Badge>
                      )}
                    </td>
                    <td className="text-slate-500">{formatDateTime(sale.createdAt)}</td>
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
