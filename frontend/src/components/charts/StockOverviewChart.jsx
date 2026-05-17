import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatNumber } from "../../utils/formatters.js";

/** Current stock levels by material */
export default function StockOverviewChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <Tooltip
          formatter={(value, _name, props) => [
            `${formatNumber(value)} KG`,
            props.payload.fullName || "Stock",
          ]}
        />
        <Bar dataKey="stock" fill="#6366f1" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
