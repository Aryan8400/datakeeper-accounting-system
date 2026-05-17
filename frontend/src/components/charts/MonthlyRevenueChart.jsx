import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatCurrencyCompact } from "../../utils/formatters.js";

/** Monthly revenue area chart */
export default function MonthlyRevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={formatCurrencyCompact} />
        <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
        <Area type="monotone" dataKey="revenue" stroke="#059669" fill="url(#revenueGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
