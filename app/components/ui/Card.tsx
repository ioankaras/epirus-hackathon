import Link from "next/link";

interface CardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  iconClassName?: string;
}

export default function Card({ href, icon, label, sublabel, iconClassName }: CardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 bg-surface rounded-2xl p-5 min-h-[72px] active:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-action-blue/40 select-none"
    >
      <div className={`flex items-center justify-center w-14 h-14 rounded-full shrink-0 ${iconClassName ?? "bg-action-blue/10 text-action-blue"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-semibold text-primary-navy">{label}</div>
      </div>
      <svg
        className="w-6 h-6 text-text-secondary shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
