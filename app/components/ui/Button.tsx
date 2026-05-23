"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "secondary";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  fullWidth = true,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "min-h-[56px] px-6 rounded-xl text-xl font-semibold focus:outline-none focus:ring-4 focus:ring-action-blue/40 select-none";

  const variants = {
    primary: "bg-action-blue text-white active:bg-action-blue-hover",
    danger: "bg-accent-red text-white active:bg-red-900",
    secondary:
      "bg-surface text-primary-navy border-2 border-border active:bg-gray-100",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Παρακαλώ περιμένετε..." : children}
    </button>
  );
}
