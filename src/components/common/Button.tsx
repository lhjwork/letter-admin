import { forwardRef } from "react";
import "./Button.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = "primary", size = "md", loading = false, disabled, className = "", ...props }, ref) => {
  return (
    <button ref={ref} className={`btn btn--${variant} btn--${size} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <span className="btn__spinner" /> : children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
