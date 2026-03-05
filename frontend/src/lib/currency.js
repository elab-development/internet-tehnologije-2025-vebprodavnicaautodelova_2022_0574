const API_URL = 'https://open.er-api.com/v6/latest/USD';

export async function fetchRates() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`Currency API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data || data.result !== 'success' || !data.rates) {
    throw new Error('Currency API returned invalid response.');
  }

  const rates = data.rates;
  rates.USD = 1;
  return data.rates;
}

export function convertFromUSD(amount, rate) {
  if (!rate) return amount;
  return amount * rate;
}

export function formatCurrency(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount);
}
