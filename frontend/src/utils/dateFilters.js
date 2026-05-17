/** Filter sales by report period */

export function isSameDay(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isInWeek(date, ref = new Date()) {
  const d = new Date(date);
  const r = new Date(ref);
  const start = new Date(r);
  start.setDate(r.getDate() - r.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}

export function isInMonth(date, ref = new Date()) {
  const d = new Date(date);
  const r = new Date(ref);
  return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth();
}

export function isInYear(date, ref = new Date()) {
  return new Date(date).getFullYear() === new Date(ref).getFullYear();
}

export function filterSalesByPeriod(sales, period) {
  const now = new Date();
  switch (period) {
    case "daily":
      return sales.filter((s) => isSameDay(s.createdAt, now));
    case "weekly":
      return sales.filter((s) => isInWeek(s.createdAt, now));
    case "monthly":
      return sales.filter((s) => isInMonth(s.createdAt, now));
    case "yearly":
      return sales.filter((s) => isInYear(s.createdAt, now));
    default:
      return sales;
  }
}

export function groupSalesByDay(sales, days = 7) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-NP", { weekday: "short" });
    const daySales = sales.filter((s) => isSameDay(s.createdAt, d));
    result.push({
      label,
      sales: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
      count: daySales.length,
    });
  }
  return result;
}

export function groupSalesByMonth(sales, months = 6) {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString("en-NP", { month: "short" });
    const monthSales = sales.filter((s) => {
      const sd = new Date(s.createdAt);
      return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
    });
    result.push({
      label,
      revenue: monthSales.reduce((sum, s) => sum + s.totalAmount, 0),
    });
  }
  return result;
}
