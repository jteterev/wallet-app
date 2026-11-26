import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function NotFound() {
  return (
    <section className="screen screen--not-found" data-screen="not-found">
      <Header showNav={false} />
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-card__title">Страница не найдена</h1>
          <p className="auth-card__text">
            Такой страницы нет или она была перемещена.
          </p>
          <Link className="btn btn--primary btn--full" to="/">
            На главную
          </Link>
        </div>
      </div>
    </section>
  );
}
