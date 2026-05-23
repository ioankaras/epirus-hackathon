"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBankContext } from "@/components/providers/BankProvider";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { formatCurrency } from "@/lib/utils";
import type { Contact } from "@/lib/types";

type Step = "contact" | "amount" | "confirm";

export default function SendPage() {
  const router = useRouter();
  const { contacts, account, loading, refreshAccount, refreshTransactions } =
    useBankContext();

  const [step, setStep] = useState<Step>("contact");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl text-text-secondary">Φόρτωση...</p>
      </div>
    );
  }

  const parsedAmount = parseFloat(amount);
  const amountValid = !isNaN(parsedAmount) && parsedAmount > 0;

  async function handleSubmit() {
    if (!selectedContact || !amountValid) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedContact.id,
          amount: parsedAmount,
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([refreshAccount(), refreshTransactions()]);
        setFeedback({
          type: "success",
          title: "Τα χρήματα στάλθηκαν!",
          message: `${formatCurrency(parsedAmount)} στάλθηκαν σε ${selectedContact.name}`,
        });
      } else {
        setFeedback({
          type: "error",
          title: "Κάτι πήγε στραβά",
          message: data.error || "Παρακαλώ δοκιμάστε ξανά",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        title: "Σφάλμα σύνδεσης",
        message: "Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Αποστολή Χρημάτων" />

      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold text-primary-navy mb-6">Αποστολή Χρημάτων</h1>
        {/* Step 1: Pick Contact */}
        {step === "contact" && (
          <div>
            <h2 className="text-xl font-bold text-primary-navy mb-4">
              Σε ποιον θέλετε να στείλετε χρήματα;
            </h2>
            <div className="flex flex-col gap-3">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    setSelectedContact(contact);
                    setStep("amount");
                  }}
                  className="flex items-center gap-4 bg-surface rounded-2xl p-5 min-h-[72px] w-full text-left active:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-action-blue/40"
                >
                  <div className="w-14 h-14 rounded-full bg-action-blue flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {contact.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-primary-navy">
                      {contact.name}
                    </p>
                    <p className="text-sm text-text-secondary truncate">
                      {contact.accountNumber}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Enter Amount */}
        {step === "amount" && selectedContact && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-action-blue flex items-center justify-center text-white text-lg font-bold shrink-0">
                {selectedContact.initials}
              </div>
              <div>
                <p className="text-lg font-semibold text-primary-navy">
                  Αποστολή σε {selectedContact.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <Input
                label="Ποσό (EUR)"
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
              <Input
                label="Περιγραφή (προαιρετικό)"
                id="description"
                placeholder="π.χ. Ενοίκιο, Δώρο..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {account && (
                <p className="text-base text-text-secondary">
                  Διαθέσιμο: {formatCurrency(account.balance)}
                </p>
              )}
              <div className="flex gap-3 mt-4">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setStep("contact")}
                >
                  Πίσω
                </Button>
                <Button
                  fullWidth
                  onClick={() => setStep("confirm")}
                  disabled={!amountValid || parsedAmount > (account?.balance ?? 0)}
                >
                  Συνέχεια
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && selectedContact && (
          <div>
            <h2 className="text-xl font-bold text-primary-navy mb-6">
              Επιβεβαίωση μεταφοράς
            </h2>

            <div className="bg-surface rounded-3xl p-6 flex flex-col gap-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base text-text-secondary">Προς</span>
                <span className="text-lg font-semibold text-primary-navy">
                  {selectedContact.name}
                </span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between items-center">
                <span className="text-base text-text-secondary">Ποσό</span>
                <span className="text-2xl font-bold text-primary-navy">
                  {formatCurrency(parsedAmount)}
                </span>
              </div>
              {description && (
                <>
                  <hr className="border-border" />
                  <div className="flex justify-between items-center">
                    <span className="text-base text-text-secondary">
                      Περιγραφή
                    </span>
                    <span className="text-lg text-primary-navy">
                      {description}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setStep("amount")}
              >
                Back
              </Button>
              <Button fullWidth loading={submitting} onClick={handleSubmit} className="text-base">
                Αποστολή
              </Button>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <FeedbackModal
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => {
            setFeedback(null);
            if (feedback.type === "success") {
              router.push("/");
            }
          }}
        />
      )}
    </div>
  );
}
