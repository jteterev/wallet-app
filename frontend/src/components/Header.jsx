import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const navItems = [
  { label: "Мои расходы", path: "/expenses" },
  { label: "Анализ расходов", path: "/analytics" },
];

export default function Header({ showNav = true }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="header">
      <div className="header__inner">
        <Logo />

        {showNav && (
          <nav className="nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav__btn ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {showNav && user && (
          <button type="button" className="nav__btn--logout" onClick={handleLogout}>
            Выйти
          </button>
        )}
      </div>
    </header>
  );
}

