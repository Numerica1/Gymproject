export const currencyPrefix = "Rs";

export function formatCurrency(value: number | string, options: { decimals?: number } = {}) {
  const numericValue =
    typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const decimals = options.decimals ?? (Number.isInteger(safeValue) ? 0 : 2);

  return `${currencyPrefix} ${safeValue.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
