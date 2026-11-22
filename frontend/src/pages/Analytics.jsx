import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "../constants/categories";
import { SAMPLE_EXPENSES } from "../data/sampleExpenses";
import { formatAmount } from "../utils/format";
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

export default function Analytics() {
  const { user } = useAuth();
  const [expenses] = useState(() => readExpenses(user));
  const [selectedDate, setSelectedDate] = useState(
    () => maxISODate(expenses.map((expense) => expense.date)) ?? toISODate(),
  );

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

  const selectedMonth = monthFromISODate(selectedDate);
  const selectedMonthRef = useRef(null);

  useEffect(() => {
    selectedMonthRef.current?.scrollIntoView?.({ block: "nearest" });
  }, []);

  const { total, totalsByCategory, maxCategoryTotal, dayCount } = useMemo(() => {
    const dayExpenses = expenses.filter(
      (expense) => expense.date === selectedDate,
    );

    const totals = {};
    let sum = 0;

    for (const expense of dayExpenses) {
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
      sum += expense.amount;
    }

    return {
      total: sum,
      totalsByCategory: totals,
      maxCategoryTotal: Math.max(
        ...CATEGORY_LABELS.map((label) => totals[label] ?? 0),
        1,
      ),
      dayCount: dayExpenses.length,
    };
  }, [expenses, selectedDate]);

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
            <div className="weekdays">
              {WEEKDAYS.map((weekday) => (
                <div key={weekday}>{weekday}</div>
              ))}
            </div>
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
                      const isSelected = isoDate === selectedDate;
                      const isToday = isoDate === today;
                      const isFuture = isFutureISODate(isoDate, today);

                      return (
                        <button
                          key={isoDate}
                          type="button"
                          className={`calendar-day${
                            isSelected ? " is-selected" : ""
                          }${isToday ? " is-today" : ""}`}
                          onClick={() => setSelectedDate(isoDate)}
                          disabled={isFuture}
                          aria-pressed={isSelected}
                          aria-current={isToday ? "date" : undefined}
                          aria-label={formatDateRu(isoDate)}
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

          {/* График */}
          <div className="card">
            <div className="chart-total">{formatAmount(total)}</div>
            <div className="chart-subtitle">
              Расходы за {formatDateRu(selectedDate)}
              {dayCount === 0 ? " — за этот день расходов нет" : ""}
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
