/** Labeled text input */
export default function Input({ label, id, error, className = "", ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input id={id} className={`input-field ${error ? "border-red-400 focus:ring-red-500/10" : ""}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
