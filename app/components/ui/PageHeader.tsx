"use client";

import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
}

export default function PageHeader({
  title: _title,
  showBack = true,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 min-h-[64px] bg-primary-navy border-l-[5px] border-accent-red px-4 py-4 shadow-sm">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-11 h-11 rounded-full text-white active:bg-white/10 focus:outline-none"
          aria-label="Go back"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      <h1 className="text-2xl font-bold text-white">Πίσω</h1>
    </header>
  );
}
