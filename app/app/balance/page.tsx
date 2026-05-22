"use client";

import { useBankContext } from "@/components/providers/BankProvider";
import PageHeader from "@/components/ui/PageHeader";
import AmountDisplay from "@/components/ui/AmountDisplay";
import { formatDate, formatTime } from "@/lib/utils";

export default function BalancePage() {
  const { account, loading } = useBankContext();

  if (loading || !account) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Balance" />

      <div className="px-5 py-8 flex flex-col items-center gap-6">
        <div className="bg-surface rounded-3xl p-8 w-full text-center shadow-sm">
          <p className="text-lg text-text-secondary mb-2">Available Balance</p>
          <AmountDisplay amount={account.balance} className="text-primary-navy" />
          <p className="text-base text-text-secondary mt-4">
            Last updated: {formatDate(account.lastUpdated)} at{" "}
            {formatTime(account.lastUpdated)}
          </p>
        </div>

        <div className="bg-surface rounded-3xl p-6 w-full shadow-sm">
          <h2 className="text-xl font-bold text-primary-navy mb-4">
            Account Details
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-base text-text-secondary">Account Holder</p>
              <p className="text-lg font-semibold">{account.name}</p>
            </div>
            <div>
              <p className="text-base text-text-secondary">Account Number</p>
              <p className="text-lg font-semibold font-mono tracking-wider">
                {account.accountNumber}
              </p>
            </div>
            <div>
              <p className="text-base text-text-secondary">Currency</p>
              <p className="text-lg font-semibold">{account.currency}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
