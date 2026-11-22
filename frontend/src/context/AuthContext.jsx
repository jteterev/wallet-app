import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  storageRegister,
  storageLogin,
  storageSetCurrentUser,
  storageGetCurrentUser,
  storageClearCurrentUser,
} from "../services/storage";

const AuthContext = createContext(null);

function readSavedUser() {
  const saved = storageGetCurrentUser();
  return saved ? { id: saved.id, name: saved.name, email: saved.email } : null;
}

export default function AuthProvider() {
  const [user, setUser] = useState(readSavedUser);

  const register = useCallback(async (name, email, password) => {
    const data = await storageRegister(name, email, password);
    storageSetCurrentUser(data.user);
    setUser(data.user);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await storageLogin(email, password);
    storageSetCurrentUser(data.user);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    storageClearCurrentUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, register, login, logout }),
    [user, register, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Пропускает дальше только авторизованных, иначе — на страницу входа. */
export function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children ?? <Outlet />;
}
