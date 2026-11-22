const USERS_KEY = "wallet_users";
const EXPENSES_KEY = "wallet_expenses";
const CURRENT_USER_KEY = "wallet_current_user";
const SEEDED_PREFIX = "wallet_seeded_";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  error.data = { error: message };
  return error;
}

function getUsers() {
  return readJSON(USERS_KEY, []);
}

function getExpenses() {
  return readJSON(EXPENSES_KEY, []);
}

function toPublicUser({ id, name, email }) {
  return { id, name, email };
}

export function storageRegister(name, email, password) {
  const users = getUsers();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (users.some((user) => String(user.email).toLowerCase() === normalizedEmail)) {
    throw createError("Пользователь с таким email уже зарегистрирован", 400);
  }

  const user = {
    id: createId(),
    name: String(name).trim(),
    email: normalizedEmail,
    password,
  };

  users.push(user);
  writeJSON(USERS_KEY, users);

  return { user: toPublicUser(user) };
}

export function storageLogin(identifier, password) {
  const value = String(identifier).trim().toLowerCase();
  const user = getUsers().find(
    (candidate) =>
      (String(candidate.email).toLowerCase() === value ||
        String(candidate.name).toLowerCase() === value) &&
      candidate.password === password,
  );

  if (!user) {
    throw createError("Неверный email или пароль", 401);
  }

  return { user: toPublicUser(user) };
}

/** Расходы пользователя, новые сверху. */
export function storageGetExpenses(userId) {
  return getExpenses()
    .filter((expense) => expense.userId === userId)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/** Добавляет несколько расходов одним обращением к localStorage. */
export function storageAddExpenses(userId, expenses) {
  if (!Array.isArray(expenses) || expenses.length === 0) return [];

  const all = getExpenses();
  const created = expenses.map((expense) => ({
    id: createId(),
    userId,
    ...expense,
  }));

  writeJSON(EXPENSES_KEY, [...all, ...created]);
  return created;
}

export function storageAddExpense(userId, expense) {
  const [created] = storageAddExpenses(userId, [expense]);
  return created;
}

/** Удаляет расход, только если он принадлежит пользователю. */
export function storageDeleteExpense(userId, id) {
  const all = getExpenses();
  const next = all.filter(
    (expense) => !(expense.userId === userId && expense.id === id),
  );
  if (next.length === all.length) return false;

  writeJSON(EXPENSES_KEY, next);
  return true;
}

/**
 * Наполняет хранилище демо-данными один раз на пользователя.
 * Возвращает добавленные расходы (или пустой массив, если наполнение не нужно).
 */
export function storageSeedExpenses(userId, expenses) {
  const seededKey = `${SEEDED_PREFIX}${userId}`;

  if (localStorage.getItem(seededKey) === "1") return [];

  const hasExpenses = getExpenses().some((expense) => expense.userId === userId);
  const created = hasExpenses ? [] : storageAddExpenses(userId, expenses);
  localStorage.setItem(seededKey, "1");

  return created;
}

export function storageSetCurrentUser(user) {
  writeJSON(CURRENT_USER_KEY, user);
}

export function storageGetCurrentUser() {
  return readJSON(CURRENT_USER_KEY, null);
}

export function storageClearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
