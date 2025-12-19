import "./Button.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({ children, variant = "primary", size = "md", loading = false, disabled, className = "", ...props }: ButtonProps) {
  return (
    <button className={`btn btn--${variant} btn--${size} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <span className="btn__spinner" /> : children}
    </button>
  );
}
