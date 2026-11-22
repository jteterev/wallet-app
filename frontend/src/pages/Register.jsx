import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import LinkText from "../components/LinkText";

const EMPTY_ERRORS = { name: false, email: false, password: false };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("Ева Ива");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  function clearError(field) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      name: !name.trim(),
      email: !email.trim() || !email.includes("@"),
      password: password.trim().length < 6,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/expenses", { replace: true });
    } catch {
      setErrors({ name: true, email: true, password: true });
    } finally {
      setSubmitting(false);
    }
  }

  const hasErrors = errors.name || errors.email || errors.password;

  return (
    <section className="screen screen--register" data-screen="register">
      <Header showNav={false} />
      <div className="auth-page">
        <div className="auth-card auth-card--register">
          <h1 className="auth-card__title">Регистрация</h1>
          <form className="form" onSubmit={handleSubmit}>
            <InputField
              label="Имя"
              name="name"
              value={name}
              onChange={(value) => {
                setName(value);
                clearError("name");
              }}
              error={errors.name}
              placeholder="Ева Ива"
              showLabel
              autoComplete="name"
            />
            <InputField
              label="Эл. почта"
              name="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                clearError("email");
              }}
              type="email"
              error={errors.email}
              placeholder="Эл. почта"
              showLabel
              autoComplete="email"
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
              showLabel
              autoComplete="new-password"
            />
            {hasErrors && (
              <div className="error-text" role="alert">
                УПС! Введенные вами данные некорректны. Введите данные корректно
                и повторите попытку.
              </div>
            )}
            <PrimaryButton full type="submit" disabled={submitting}>
              Зарегистрироваться
            </PrimaryButton>
          </form>
          <div className="auth-card__footer">
            <span className="muted">Уже есть аккаунт?</span>
            <LinkText text="Войдите здесь" to="/login" />
          </div>
        </div>
      </div>
    </section>
  );
}
