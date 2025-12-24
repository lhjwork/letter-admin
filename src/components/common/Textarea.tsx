import { forwardRef, TextareaHTMLAttributes } from "react";
import "./Textarea.scss";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = "", label, error, helperText, ...props }, ref) => {
  return (
    <div className={`textarea-wrapper ${className}`}>
      {label && <label className="textarea-wrapper__label">{label}</label>}
      <textarea ref={ref} className={`textarea ${error ? "textarea--error" : ""}`} {...props} />
      {error && <div className="textarea-wrapper__error">{error}</div>}
      {helperText && !error && <div className="textarea-wrapper__helper">{helperText}</div>}
    </div>
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
