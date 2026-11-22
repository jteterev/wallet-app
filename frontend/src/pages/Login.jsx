import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import LinkText from "../components/LinkText";

const EMPTY_ERRORS = { email: false, password: false };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/expenses";
  const [email, setEmail] = useState("ivanova");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  function clearError(field) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      email: !email.trim(),
      password: !password.trim(),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      setErrors({ email: true, password: true });
    } finally {
      setSubmitting(false);
    }
  }

  const hasErrors = errors.email || errors.password;

  return (
    <section className="screen screen--login" data-screen="login">
      <Header showNav={false} />
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-card__title">Вход</h1>
          <form className="form" onSubmit={handleSubmit}>
            <InputField
              label="Эл. почта"
              name="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                clearError("email");
              }}
              error={errors.email}
              placeholder="ivanova"
              autoComplete="username"
            />
            <InputField
              label="Пароль"
              name="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                clearError("password");
              }}
              type="password"
              error={errors.password}
              placeholder="Пароль"
              autoComplete="current-password"
            />
            {hasErrors && (
              <div className="error-text" role="alert">
                УПС! Введенные вами данные некорректны. Введите данные корректно
                и повторите попытку.
              </div>
            )}
            <PrimaryButton full type="submit" disabled={submitting}>
              Войти
            </PrimaryButton>
          </form>
          <div className="auth-card__footer">
            <span className="muted">Нужно зарегистрироваться?</span>
            <LinkText text="Регистрируйтесь здесь" to="/register" />
          </div>
        </div>
      </div>
    </section>
  );
}
