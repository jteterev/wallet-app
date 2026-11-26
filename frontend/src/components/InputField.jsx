import { useId } from "react";

export default function InputField({
  label,
  value,
  onChange,
  type = "text",
  error,
  placeholder,
  showLabel = false,
  name,
  autoComplete,
  inputMode,
}) {
  const inputId = useId();

  return (
    <div
      className={`field ${error ? "field--error" : ""} ${
        showLabel ? "field--show-label" : ""
      }`}
    >
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
          {error && (
            <span className="label__star" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        className={`input ${error ? "input--error" : ""} ${
          !error && value ? "input--filled" : ""
        }`}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error || undefined}
      />
    </div>
  );
}

