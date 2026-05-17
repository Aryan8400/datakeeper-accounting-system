import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "../../utils/formatters.js";

/** Last 7 days sales bar chart */
export default function DailySalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={formatCurrencyCompact} />
        <Tooltip
          formatter={(value) => [formatCurrency(value), "Sales"]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            background: "var(--tooltip-bg, #fff)",
          }}
        />
        <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
