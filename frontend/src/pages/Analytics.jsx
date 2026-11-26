import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../constants/categories";
import { SAMPLE_EXPENSES } from "../data/sampleExpenses";
import { formatAmount, pluralRu } from "../utils/format";
import {
  buildMonthGrid,
  buildPeriodMonths,
  compareMonths,
  currentMonth,
  formatDateRu,
  isFutureISODate,
  maxISODate,
  minISODate,
  monthFromISODate,
  MONTHS_RU,
  toISODate,
  toISODateFromParts,
  WEEKDAYS,
} from "../utils/date";
import {
  storageGetExpenses,
  storageSeedExpenses,
} from "../services/storage";

/** Расходы пользователя вместе с демо-данными (наполнение идемпотентно). */
function readExpenses(user) {
  if (!user) return [];
  storageSeedExpenses(user.id, SAMPLE_EXPENSES);
  return storageGetExpenses(user.id);
}

/** Период по умолчанию — месяц последнего расхода. */
function initialRange(expenses) {
  const lastDate =
    maxISODate(expenses.map((expense) => expense.date)) ?? toISODate();
  const month = monthFromISODate(lastDate);

  return {
    start: month ? toISODateFromParts(month.year, month.month, 1) : lastDate,
    end: lastDate,
  };
}

export default function Analytics() {
  const { user } = useAuth();
  const [expenses] = useState(() => readExpenses(user));
  const [{ start, end }, setRange] = useState(() => initialRange(expenses));

  /** Сегодняшняя дата: ею ограничены и периоды, и выбор дня. */
  const today = useMemo(() => toISODate(), []);

  /** Месяцы календаря: от месяца первого расхода до текущего месяца. */
  const months = useMemo(() => {
    const todayMonth = currentMonth();
    const firstMonth = monthFromISODate(
      minISODate(expenses.map((expense) => expense.date)),
    );
    const from = firstMonth ?? todayMonth;
    const to = compareMonths(from, todayMonth) > 0 ? from : todayMonth;

    return buildPeriodMonths({ from, to });
  }, [expenses]);

  const selectedMonth = monthFromISODate(end);
  const selectedMonthRef = useRef(null);

  useEffect(() => {
    selectedMonthRef.current?.scrollIntoView?.({ block: "start" });
  }, []);

  /**
   * Клик по дню: первый задаёт начало периода, второй — конец.
   * Если период уже выбран, клик начинает новый.
   */
  function selectDate(isoDate) {
    setRange((prev) => {
      if (prev.start === prev.end) {
        return isoDate < prev.start
          ? { start: isoDate, end: prev.start }
          : { start: prev.start, end: isoDate };
      }

      return { start: isoDate, end: isoDate };
    });
  }

  const {
    total,
    totalsByCategory,
    maxCategoryTotal,
    expenseCount,
    activeDays,
  } = useMemo(() => {
    const rangeExpenses = expenses.filter(
      (expense) => expense.date >= start && expense.date <= end,
    );

    const totals = {};
    const days = new Set();
    let sum = 0;

    for (const expense of rangeExpenses) {
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
      sum += expense.amount;
      days.add(expense.date);
    }

    return {
      total: sum,
      totalsByCategory: totals,
      maxCategoryTotal: Math.max(
        ...CATEGORY_LABELS.map((label) => totals[label] ?? 0),
        1,
      ),
      expenseCount: rangeExpenses.length,
      activeDays: days.size,
    };
  }, [expenses, start, end]);

  const isSingleDay = start === end;
  const periodTitle = isSingleDay
    ? `Расходы за ${formatDateRu(start)}`
    : `Расходы с ${formatDateRu(start)} по ${formatDateRu(end)}`;
  const periodHint = isSingleDay
    ? "Выберите вторую дату периода"
    : "Кликните по дате, чтобы начать новый период";

  if (!user) return null;

  return (
    <section className="screen screen--analytics" data-screen="analytics">
      <Header showNav />
      <div className="page">
        <h1 className="page__title">Анализ расходов</h1>
        <div className="analytics-layout">
          {/* Календарь */}
          <div className="card calendar-card">
            <h2 className="calendar-header">Период</h2>
            <p className="calendar-hint">{periodHint}</p>
            <div className="weekdays">
              {WEEKDAYS.map((weekday) => (
                <div key={weekday}>{weekday}</div>
              ))}
            </div>
            <div className="calendar-scroll">
              {months.map(({ year, month }) => {
                const isSelectedMonth =
                  selectedMonth !== null &&
                  selectedMonth.year === year &&
                  selectedMonth.month === month;

                return (
                  <div
                    className="month-group"
                    key={`${year}-${month}`}
                    ref={isSelectedMonth ? selectedMonthRef : null}
                  >
                    <div className="month-name">
                      {MONTHS_RU[month]} {year}
                    </div>
                    <div className="calendar-grid">
                      {buildMonthGrid(year, month).map((day, index) => {
                        if (day === null) {
                          return (
                            <div key={`empty-${index}`} className="calendar-day empty" />
                          );
                        }

                        const isoDate = toISODateFromParts(year, month, day);
                        const isRangeStart = isoDate === start;
                        const isRangeEnd = isoDate === end;
                        const isSelected = isRangeStart || isRangeEnd;
                        const isInRange = isoDate > start && isoDate < end;
                        const isToday = isoDate === today;
                        const isFuture = isFutureISODate(isoDate, today);
                        const edgeLabel =
                          isRangeStart && !isRangeEnd
                            ? ", начало периода"
                            : isRangeEnd && !isRangeStart
                              ? ", конец периода"
                              : "";

                        return (
                          <button
                            key={isoDate}
                            type="button"
                            className={`calendar-day${
                              isSelected ? " is-selected" : ""
                            }${isInRange ? " is-in-range" : ""}${
                              isToday ? " is-today" : ""
                            }`}
                            onClick={() => selectDate(isoDate)}
                            disabled={isFuture}
                            aria-pressed={isSelected}
                            aria-current={isToday ? "date" : undefined}
                            aria-label={`${formatDateRu(isoDate)}${edgeLabel}`}
                            title={isFuture ? "Дата ещё не наступила" : undefined}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* График */}
          <div className="card">
            <div className="chart-total">{formatAmount(total)}</div>
            <div className="chart-subtitle">
              {periodTitle}
              {expenseCount === 0
                ? isSingleDay
                  ? " — за этот день расходов нет"
                  : " — за этот период расходов нет"
                : ` · ${expenseCount} ${pluralRu(expenseCount, [
                    "расход",
                    "расхода",
                    "расходов",
                  ])} за ${activeDays} ${pluralRu(activeDays, [
                    "день",
                    "дня",
                    "дней",
                  ])}`}
            </div>
            <div className="chart-placeholder">
              {CATEGORY_LABELS.map((label) => {
                const value = totalsByCategory[label] ?? 0;

                return (
                  <div
                    key={label}
                    className="bar"
                    style={{
                      height: `${Math.max((value / maxCategoryTotal) * 100, 2)}%`,
                      background: CATEGORY_COLORS[label],
                    }}
                  >
                    <span className="bar-label">{formatAmount(value)}</span>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              {CATEGORY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
