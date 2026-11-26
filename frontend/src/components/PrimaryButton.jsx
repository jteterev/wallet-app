export default function PrimaryButton({
  children,
  full = true,
  onClick,
  type = "button",
  disabled,
}) {
  return (
    <button
      className={`btn btn--primary ${full ? "btn--full" : ""}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
