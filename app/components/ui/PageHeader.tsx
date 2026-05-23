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
    <header className="sticky top-0 z-10 bg-gradient-brand-diagonal text-white px-4 py-4 flex items-center gap-3 min-h-[64px] rounded-b-3xl">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-11 h-11 rounded-full active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
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
      <h1 className="text-2xl font-bold">Πίσω</h1>
    </header>
  );
}
