import "./Input.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-wrapper__label">{label}</label>}
      <input className={`input-wrapper__input ${error ? "input-wrapper__input--error" : ""}`} {...props} />
      {error && <span className="input-wrapper__error">{error}</span>}
    </div>
  );
}
