import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";
import { SAMPLE_EXPENSES } from "../data/sampleExpenses";
import { formatAmount } from "../utils/format";
import { formatDateDot, isFutureISODate, toISODate } from "../utils/date";
import {
  storageAddExpense,
  storageDeleteExpense,
  storageGetExpenses,
  storageSeedExpenses,
} from "../services/storage";

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState(() =>
    user ? storageGetExpenses(user.id) : [],
  );
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [date, setDate] = useState(() => toISODate());
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!user) return;
    storageSeedExpenses(user.id, SAMPLE_EXPENSES);
    setExpenses(storageGetExpenses(user.id));
  }, [user]);

  function handleAdd(event) {
    event.preventDefault();
    if (!user) return;

    const trimmedTitle = title.trim();
    const numericAmount = Number(amount);
    if (
      !trimmedTitle ||
      !date ||
      isFutureISODate(date) ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return;
    }

    const created = storageAddExpense(user.id, {
      title: trimmedTitle,
      category,
      date,
      amount: numericAmount,
    });

    setExpenses((prev) => [created, ...prev]);
    setTitle("");
    setAmount("");
  }

  function handleDelete(id) {
    if (!user) return;
    if (!storageDeleteExpense(user.id, id)) return;
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  }

  if (!user) return null;

  return (
    <section className="screen screen--expenses" data-screen="expenses">
      <Header showNav />
      <div className="page">
        <h1 className="page__title">Мои расходы</h1>
        <div className="expenses-layout">
          {/* Левая колонка — таблица */}
          <div className="card">
            <h2 className="card__title">Таблица расходов</h2>
            <div className="table">
              <div className="table__head">
                <div>Описание</div>
                <div>Категория</div>
                <div>Дата</div>
                <div>Сумма</div>
                <div />
              </div>
              {expenses.map((expense) => (
                <div key={expense.id} className="table__row">
                  <div>{expense.title}</div>
                  <div>{expense.category}</div>
                  <div>{formatDateDot(expense.date)}</div>
                  <div>{formatAmount(expense.amount)}</div>
                  <button
                    type="button"
                    className="table__action"
                    onClick={() => handleDelete(expense.id)}
                    aria-label={`Удалить расход «${expense.title}»`}
                    title="Удалить расход"
                  >
                    🗑
                  </button>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="table__row">
                  <div className="table__empty">Расходов пока нет</div>
                </div>
              )}
            </div>
          </div>
          {/* Правая колонка — форма нового расхода */}
          <div className="card">
            <h2 className="card__title">Новый расход</h2>
            <form className="new-form" onSubmit={handleAdd}>
              <div className="field">
                <label className="label" htmlFor="expense-title">
                  Описание
                </label>
                <input
                  id="expense-title"
                  name="title"
                  className="input input--rounded"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Введите описание"
                  autoComplete="off"
                />
              </div>

              <div className="field">
                <span className="label" id="expense-category-label">
                  Категория
                </span>
                <div
                  className="category-grid"
                  role="group"
                  aria-labelledby="expense-category-label"
                >
                  {CATEGORIES.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className={`category-btn ${
                        category === item.label ? "active" : ""
                      }`}
                      onClick={() => setCategory(item.label)}
                      aria-pressed={category === item.label}
                    >
                      <span aria-hidden="true">{item.emoji}</span> {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="expense-date">
                  Дата
                </label>
                <input
                  id="expense-date"
                  name="date"
                  className="input input--rounded"
                  type="date"
                  value={date}
                  max={toISODate()}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="expense-amount">
                  Сумма
                </label>
                <input
                  id="expense-amount"
                  name="amount"
                  className="input input--rounded"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="Введите сумму"
                />
              </div>

              <PrimaryButton full type="submit">
                Добавить новый расход
              </PrimaryButton>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

