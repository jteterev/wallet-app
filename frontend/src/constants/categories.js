/**
 * Единственный источник правды по категориям расходов.
 * Используется и на экране «Мои расходы», и в «Анализе расходов».
 */
export const CATEGORIES = [
  { label: "Еда", emoji: "🍔", color: "#d8b4fe" },
  { label: "Транспорт", emoji: "🚗", color: "#fbbf24" },
  { label: "Жильё", emoji: "🏠", color: "#a5b4fc" },
  { label: "Развлечения", emoji: "🎬", color: "#818cf8" },
  { label: "Образование", emoji: "🎓", color: "#a3e635" },
  { label: "Другое", emoji: "📦", color: "#fca5a5" },
];

export const CATEGORY_LABELS = CATEGORIES.map((category) => category.label);

export const CATEGORY_COLORS = CATEGORIES.reduce((acc, category) => {
  acc[category.label] = category.color;
  return acc;
}, {});

export const DEFAULT_CATEGORY = CATEGORIES[0].label;
