"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-lg font-medium text-primary-navy">
        {label}
      </label>
      <input
        id={id}
        className={`min-h-[56px] px-4 text-xl bg-surface border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-action-blue/40 ${
          error
            ? "border-accent-red focus:border-accent-red"
            : "border-border focus:border-action-blue"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-base text-accent-red font-medium">{error}</p>
      )}
    </div>
  );
}
