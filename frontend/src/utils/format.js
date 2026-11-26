const amountFormatter = new Intl.NumberFormat("ru-RU");

/** 3500 -> «3 500 ₽» */
export function formatAmount(amount) {
  return `${amountFormatter.format(Number(amount) || 0)} ₽`;
}

/**
 * Форма слова для числа: pluralRu(5, ["расход", "расхода", "расходов"]) -> "расходов".
 * forms: [1, 2-4, 0 и 5-20].
 */
export function pluralRu(count, forms) {
  const value = Math.abs(Number(count) || 0) % 100;
  const lastDigit = value % 10;

  if (value > 10 && value < 20) return forms[2];
  if (lastDigit > 1 && lastDigit < 5) return forms[1];
  if (lastDigit === 1) return forms[0];
  return forms[2];
}
