import currencyCodes from 'currency-codes';

export type CurrencyOption = {
  code: string;
  label: string;
  digits: number;
};

export const CURRENCY_OPTIONS: CurrencyOption[] = currencyCodes.data
  .map((entry) => ({
    code: entry.code,
    label: `${entry.code} · ${entry.currency}`,
    digits: entry.digits ?? 2,
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: string) {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0);

  return parts.find((part) => part.type === 'currency')?.value ?? currency;
}
