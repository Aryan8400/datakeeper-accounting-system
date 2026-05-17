/** Dashboard KPI card */
export default function StatCard({ title, value, subtitle, icon, trend, variant = "default" }) {
  const accents = {
    default: "from-brand-500 to-brand-600",
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    purple: "from-violet-500 to-violet-600",
  };

  return (
    <div className="card-hover group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
          {trend && <p className="mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">{trend}</p>}
        </div>
        {icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accents[variant]} text-white shadow-lg transition-transform group-hover:scale-105`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
