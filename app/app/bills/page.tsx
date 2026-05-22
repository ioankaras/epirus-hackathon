"use client";

import { useState } from "react";
import { useBankContext } from "@/components/providers/BankProvider";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Bill } from "@/lib/types";

const categoryIcons: Record<Bill["category"], string> = {
  electricity: "⚡",
  water: "💧",
  phone: "📱",
  internet: "🌐",
  gas: "🔥",
};

export default function BillsPage() {
  const { bills, account, loading, refreshAccount, refreshBills, refreshTransactions } =
    useBankContext();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-text-secondary">Loading...</p>
      </div>
    );
  }

  const unpaidBills = bills.filter((b) => b.status === "unpaid");
  const paidBills = bills.filter((b) => b.status === "paid");

  async function handlePay() {
    if (!selectedBill) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId: selectedBill.id }),
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([refreshAccount(), refreshBills(), refreshTransactions()]);
        setFeedback({
          type: "success",
          title: "Bill Paid!",
          message: `${formatCurrency(selectedBill.amount)} paid to ${selectedBill.provider}`,
        });
      } else {
        setFeedback({
          type: "error",
          title: "Payment Failed",
          message: data.error || "Please try again",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        title: "Connection error",
        message: "Please check your connection and try again",
      });
    } finally {
      setSubmitting(false);
      setConfirming(false);
      setSelectedBill(null);
    }
  }

  return (
    <div>
      <PageHeader title="Pay Bills" />

      <div className="px-4 py-5">
        {unpaidBills.length === 0 && paidBills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-text-secondary">No bills found</p>
          </div>
        ) : (
          <>
            {unpaidBills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary-navy mb-3">
                  Unpaid Bills
                </h2>
                <div className="flex flex-col gap-3">
                  {unpaidBills.map((bill) => (
                    <button
                      key={bill.id}
                      onClick={() => {
                        setSelectedBill(bill);
                        setConfirming(true);
                      }}
                      className="bg-surface rounded-2xl p-5 w-full text-left active:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-action-blue/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-badge-orange/10 flex items-center justify-center text-2xl shrink-0">
                          {categoryIcons[bill.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-primary-navy">
                            {bill.provider}
                          </p>
                          <p className="text-sm text-text-secondary">
                            Due: {formatDate(bill.dueDate)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-accent-red">
                            {formatCurrency(bill.amount)}
                          </p>
                          <p className="text-xs text-badge-orange font-semibold uppercase">
                            Unpaid
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paidBills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-primary-navy mb-3">
                  Paid
                </h2>
                <div className="flex flex-col gap-3">
                  {paidBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="bg-surface rounded-2xl p-5 opacity-60"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center text-2xl shrink-0">
                          {categoryIcons[bill.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-primary-navy">
                            {bill.provider}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold text-success">
                            {formatCurrency(bill.amount)}
                          </p>
                          <p className="text-xs text-success font-semibold uppercase">
                            Paid
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirming && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-sm">
            <h2 className="text-2xl font-bold text-primary-navy mb-4 text-center">
              Confirm Payment
            </h2>
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between">
                <span className="text-text-secondary">Bill</span>
                <span className="font-semibold text-primary-navy">
                  {selectedBill.provider}
                </span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between">
                <span className="text-text-secondary">Amount</span>
                <span className="text-2xl font-bold text-primary-navy">
                  {formatCurrency(selectedBill.amount)}
                </span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between">
                <span className="text-text-secondary">Due date</span>
                <span className="font-semibold">
                  {formatDate(selectedBill.dueDate)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setConfirming(false);
                  setSelectedBill(null);
                }}
              >
                Cancel
              </Button>
              <Button fullWidth loading={submitting} onClick={handlePay}>
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <FeedbackModal
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
}
