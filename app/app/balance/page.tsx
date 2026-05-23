"use client";

import { useState } from "react";
import { useBankContext } from "@/components/providers/BankProvider";
import PageHeader from "@/components/ui/PageHeader";
import AmountDisplay from "@/components/ui/AmountDisplay";

export default function BalancePage() {
  const { account, loading } = useBankContext();
  const [copied, setCopied] = useState(false);

  function copyAccountNumber() {
    if (!account) return;
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading || !account) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-text-secondary">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Υπόλοιπο" />

      <div className="px-5 py-8 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-primary-navy self-start">Υπόλοιπο</h1>
        <div className="bg-surface rounded-3xl p-8 w-full text-center shadow-sm">
          <p className="text-xl text-text-secondary mb-2">Διαθέσιμο Υπόλοιπο</p>
          <AmountDisplay amount={account.balance} className="text-primary-navy" />
        </div>

        <div className="bg-surface rounded-3xl p-6 w-full shadow-sm">
          <h2 className="text-xl font-bold text-primary-navy mb-4">
            Στοιχεία Λογαριασμού
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-base text-text-secondary">Φιλικό Όνομα</p>
              <p className="text-lg font-semibold">{account.name}</p>
            </div>
            <div>
              <p className="text-base text-text-secondary">Δικαιούχος</p>
              <p className="text-lg font-semibold">{account.owner}</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-base text-text-secondary">Αριθμός Λογαριασμού</p>
                <button
                  onClick={copyAccountNumber}
                  className="shrink-0 p-1 rounded-lg text-text-secondary active:bg-gray-100 focus:outline-none"
                  aria-label="Αντιγραφή αριθμού λογαριασμού"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-lg font-semibold font-mono tracking-wider">
                {account.accountNumber}
              </p>
            </div>
            <div>
              <p className="text-base text-text-secondary">Νόμισμα</p>
              <p className="text-lg font-semibold">{account.currency}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
