import { formatCurrency } from "@/lib/utils";

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  size?: "large" | "medium";
  className?: string;
}

export default function AmountDisplay({
  amount,
  currency = "EUR",
  size = "large",
  className = "",
}: AmountDisplayProps) {
  const sizeClass = size === "large" ? "text-5xl" : "text-3xl";

  return (
    <span className={`font-bold tracking-tight ${sizeClass} ${className}`}>
      {formatCurrency(amount, currency)}
    </span>
  );
}
