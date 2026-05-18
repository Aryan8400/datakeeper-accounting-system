/** Alert banner */
const styles = {
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200",
  danger:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-200",
  info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200",
};

export default function Alert({ children, variant = "info", onClose, className = "" }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[variant]} ${className}`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}
