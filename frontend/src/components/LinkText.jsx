import { Link } from "react-router-dom";

export default function LinkText({ text, to }) {
  return (
    <Link className="link" to={to}>
      {text}
    </Link>
  );
}
