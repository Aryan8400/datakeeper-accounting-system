import { LOW_STOCK_THRESHOLD } from "./constants.js";

/** Sale line calculations */
export function calcSaleTotal(quantityKg, ratePerKg) {
  const qty = Number(quantityKg) || 0;
  const rate = Number(ratePerKg) || 0;
  return qty * rate;
}

export function calcDueAmount(total, paid) {
  const t = Number(total) || 0;
  const p = Number(paid) || 0;
  return Math.max(0, t - p);
}

export function calcProfit(quantityKg, sellingRate, purchasePrice) {
  const qty = Number(quantityKg) || 0;
  const sell = Number(sellingRate) || 0;
  const buy = Number(purchasePrice) || 0;
  return qty * (sell - buy);
}

/** Stock status helpers */
export function isLowStock(currentKg, initialKg) {
  if (!initialKg || initialKg <= 0) return false;
  return currentKg < initialKg * LOW_STOCK_THRESHOLD;
}

export function stockPercent(currentKg, initialKg) {
  if (!initialKg || initialKg <= 0) return 0;
  return Math.min(100, Math.round((currentKg / initialKg) * 100));
}
