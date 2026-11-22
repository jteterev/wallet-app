import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link className="logo" to="/expenses" aria-label="Skypro.Wallet — на главную">
      <img src="/assets/logo.png" alt="Skypro.Wallet" width="144" height="19" />
    </Link>
  );
}

