"use client";

import { useBankContext } from "@/components/providers/BankProvider";
import AmountDisplay from "@/components/ui/AmountDisplay";
import Card from "@/components/ui/Card";

export default function Home() {
  const { account, loading } = useBankContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Balance Header */}
      <div className="bg-primary-navy text-white px-6 pt-10 pb-8 rounded-b-3xl">
        <p className="text-base text-white/70 mb-1">Available Balance</p>
        <AmountDisplay
          amount={account?.balance ?? 0}
          className="text-white"
        />
        <p className="text-sm text-white/50 mt-3">
          {account?.name} &bull; {account?.accountNumber.slice(-8)}
        </p>
      </div>

      {/* Action Cards */}
      <div className="px-4 -mt-4 flex flex-col gap-3">
        <Card
          href="/balance"
          label="My Balance"
          sublabel="View account details"
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <Card
          href="/send"
          label="Send Money"
          sublabel="Transfer to someone"
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-4 4m4-4l4 4" />
            </svg>
          }
        />
        <Card
          href="/history"
          label="Past Transactions"
          sublabel="See your recent activity"
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <Card
          href="/bills"
          label="Pay Bills"
          sublabel="Electricity, water, phone..."
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4m5 4V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12l3-2 3 2 3-2 3 2z" />
            </svg>
          }
        />
        <Card
          href="/speech?autostart=mic"
          label="AI Speech Mode"
          sublabel="Talk through your banking tasks"
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75v2.25m0-2.25a6 6 0 006-6m-6 6a6 6 0 01-6-6m6 2.25a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
