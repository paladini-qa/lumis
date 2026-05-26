/**
 * Formats a numeric value into Brazilian Real (BRL) currency format.
 * 
 * Rules from specs:
 * - Prefix: "R$ " (with trailing space)
 * - Thousands Separator: dot "."
 * - Decimal Separator: comma ","
 * 
 * Example: 18450.72 -> "R$ 18.450,72"
 */
export function formatBRL(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  const parts = Math.abs(value).toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Regexp to add thousands separator dots
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const sign = value < 0 ? '-' : '';

  return `${sign}R$ ${formattedInteger},${decimalPart}`;
}
