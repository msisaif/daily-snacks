const numberFormat = new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 2 });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatTaka(amount: number): string {
  return `৳${numberFormat.format(amount)}`;
}
