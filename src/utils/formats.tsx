export function currency(amount: number, currency = "GBP", locale = "en-GB") {
  if (amount === null || amount === undefined) return null;
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    amount / 100
  );
}
