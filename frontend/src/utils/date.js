export const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

/** Текущий месяц (по локальной дате машины). */
export function currentMonth(date = new Date()) {
  return { year: date.getFullYear(), month: date.getMonth() };
}

const MONTHS_RU_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

/** Локальная дата в формате YYYY-MM-DD (без сдвига часового пояса). */
export function toISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** YYYY-MM-DD -> ДД.ММ.ГГГГ */
export function formatDateDot(isoDate) {
  const [year, month, day] = String(isoDate).split("-");
  if (!year || !month || !day) return String(isoDate);
  return `${day}.${month}.${year}`;
}

/** YYYY-MM-DD -> «10 июля 2024» */
export function formatDateRu(isoDate) {
  const [year, month, day] = String(isoDate).split("-");
  const monthName = MONTHS_RU_GENITIVE[Number(month) - 1];
  if (!year || !day || !monthName) return String(isoDate);
  return `${Number(day)} ${monthName} ${year}`;
}

/** "2024-07-10" -> { year: 2024, month: 6 }. */
export function monthFromISODate(isoDate) {
  const [year, month] = String(isoDate).split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, month: month - 1 };
}

/** Сравнение месяцев: <0 — a раньше b, 0 — совпадают, >0 — a позже b. */
export function compareMonths(a, b) {
  return a.year - b.year || a.month - b.month;
}

/** Самая поздняя ISO-дата из списка (null, если дат нет). */
export function maxISODate(dates) {
  let max = null;

  for (const date of dates) {
    const value = String(date ?? "");
    if (value && (max === null || value > max)) max = value;
  }

  return max;
}

/** Самая ранняя ISO-дата из списка (null, если дат нет). */
export function minISODate(dates) {
  let min = null;

  for (const date of dates) {
    const value = String(date ?? "");
    if (value && (min === null || value < min)) min = value;
  }

  return min;
}

/** Дата позже сегодняшней. */
export function isFutureISODate(isoDate, today = toISODate()) {
  return String(isoDate) > String(today);
}

/**
 * Месяцы периода в порядке возрастания.
 * По умолчанию — текущий месяц; если `from` позже `to`, период пуст.
 */
export function buildPeriodMonths({ from, to = currentMonth() } = {}) {
  const start = from ?? to;
  const months = [];

  if (compareMonths(start, to) > 0) return months;

  let { year, month } = start;

  while (year < to.year || (year === to.year && month <= to.month)) {
    months.push({ year, month });
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return months;
}

/** Ячейки месяца для сетки календаря: null — пустая ячейка перед первым днём. */
export function buildMonthGrid(year, month) {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Пн = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = new Array(firstWeekday).fill(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  return cells;
}

/** YYYY-MM-DD для конкретного дня месяца. */
export function toISODateFromParts(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
