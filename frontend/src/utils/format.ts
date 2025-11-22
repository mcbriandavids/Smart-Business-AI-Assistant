const numberFormatter = new Intl.NumberFormat();

export function formatNumber(value?: number | string | null): string {
  if (value === undefined || value === null) return "0";
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return numberFormatter.format(numeric);
}

export function formatTimestamp(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function formatCurrency(value?: number): string {
  const safe = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safe || 0);
}
