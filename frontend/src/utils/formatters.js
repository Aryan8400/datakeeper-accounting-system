/** Currency, date, and number formatting helpers — Nepalese Rupees (NPR) */

export const CURRENCY_CODE = "NPR";
export const CURRENCY_SYMBOL = "Rs.";

/** Format amount as Nepalese Rupees */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: CURRENCY_CODE,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

/** Compact axis label for charts — e.g. Rs. 31k */
export function formatCurrencyCompact(amount) {
  const value = Number(amount) || 0;
  if (value >= 100000) return `${CURRENCY_SYMBOL} ${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${CURRENCY_SYMBOL} ${(value / 1000).toFixed(0)}k`;
  return `${CURRENCY_SYMBOL} ${value}`;
}

export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat("en-NP", {
    maximumFractionDigits: decimals,
  }).format(value ?? 0);
}

export function formatDate(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-NP", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatDateTime(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-NP", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}
