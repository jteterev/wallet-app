const amountFormatter = new Intl.NumberFormat("ru-RU");

/** 3500 -> «3 500 ₽» */
export function formatAmount(amount) {
  return `${amountFormatter.format(Number(amount) || 0)} ₽`;
}
