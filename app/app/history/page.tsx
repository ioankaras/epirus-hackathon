"use client";

import { useBankContext } from "@/components/providers/BankProvider";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatTransactionDate } from "@/lib/utils";

export default function HistoryPage() {
  const { transactions, loading } = useBankContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-text-secondary">Φόρτωση...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Ιστορικό" />

      <div className="px-4 py-5 flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-primary-navy mb-2">Ιστορικό Συναλλαγών</h1>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-text-secondary">Δεν υπάρχουν συναλλαγές</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-surface rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      tx.type === "credit"
                        ? "bg-success/10 text-success"
                        : tx.type === "bill"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-accent-red/10 text-accent-red"
                    }`}
                  >
                    {tx.type === "bill" ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : tx.type === "credit" ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7-7-7 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7 7 7-7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-primary-navy leading-tight truncate" title={tx.recipient}>
                      {tx.recipient}
                    </p>
                    <p className="text-sm text-text-secondary leading-tight mt-0.5 truncate">
                      {tx.description}
                    </p>
                    <p className="text-sm text-text-secondary mt-1 whitespace-nowrap">
                      {formatTransactionDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-base font-bold whitespace-nowrap ${
                      tx.type === "credit" ? "text-success" : "text-accent-red"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {formatCurrency(tx.amount, tx.currency)}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">{tx.currency}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
