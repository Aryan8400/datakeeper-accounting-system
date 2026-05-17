/** Reusable button with variant styles */
export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    ghost:
      "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  };

  return (
    <button type={type} className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
