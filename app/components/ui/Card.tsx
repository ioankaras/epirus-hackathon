import Link from "next/link";

interface CardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  variant?: "default" | "featured";
  badge?: string;
  onActivate?: () => void;
}

export default function Card({
  href,
  icon,
  label,
  sublabel,
  variant = "default",
  badge,
  onActivate,
}: CardProps) {
  const isFeatured = variant === "featured";

  const className = isFeatured
    ? "flex items-center gap-4 rounded-2xl p-5 min-h-[72px] w-full bg-gradient-to-br from-primary-navy to-action-blue text-white active:opacity-95 focus:outline-none focus:ring-4 focus:ring-white/40 select-none"
    : "flex items-center gap-4 bg-surface rounded-2xl p-5 min-h-[72px] w-full active:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-action-blue/40 select-none";

  const content = (
    <>
      <div
        className={
          isFeatured
            ? "flex items-center justify-center w-14 h-14 rounded-full bg-white/15 text-white shrink-0 [&_svg]:w-8 [&_svg]:h-8"
            : "flex items-center justify-center w-14 h-14 rounded-full bg-action-blue/10 text-action-blue shrink-0"
        }
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={
              isFeatured
                ? "text-lg font-semibold text-white"
                : "text-lg font-semibold text-primary-navy"
            }
          >
            {label}
          </div>
          {isFeatured && badge && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {badge}
            </span>
          )}
        </div>
        {sublabel && (
          <div
            className={
              isFeatured
                ? "text-base text-white/80 truncate"
                : "text-base text-text-secondary truncate"
            }
          >
            {sublabel}
          </div>
        )}
      </div>
      <svg
        className={
          isFeatured
            ? "w-6 h-6 text-white/70 shrink-0"
            : "w-6 h-6 text-text-secondary shrink-0"
        }
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </>
  );

  if (onActivate) {
    return (
      <button type="button" onClick={onActivate} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
