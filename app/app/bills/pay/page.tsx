"use client";

import PageHeader from "@/components/ui/PageHeader";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bill } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { useBankContext } from "@/components/providers/BankProvider";

export default function BillPay() {
    const { refreshAccount } = useBankContext()
    const searchParams = useSearchParams()
    const rfCode = searchParams.get("code")

    const [bill, setBill] = useState<Bill | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        title: string;
        message: string;
    } | null>(null);

    useEffect(() => {
        if (rfCode) {
            fetch("/mock-api/bills").then(
                res => res.json().then((data: Bill[]) => {
                    const foundBill = data.find((b: Bill) => b.rf === rfCode)

                    if (foundBill) {
                        setBill(foundBill)

                        if (foundBill.status === "paid") {
                            setSuccess(true)
                        }
                    }
                })
            )
        }
    }, [rfCode])

    const handlePayment = async () => {
        if (!bill) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch("/mock-api/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            })

            const data = await response.json()

            if (!response.ok) {
                setFeedback({
                    type: "error",
                    title: "Αποτυχία Πληρωμής",
                    message: data.error || "Η πληρωμή απέτυχε",
                });
                setError(data.error || "Η πληρωμή απέτυχε")
            } else {
                setFeedback({
                    type: "success",
                    title: "Επιτυχής Πληρωμή",
                    message: data.amount
                        ? `${formatCurrency(data.amount)} πληρώθηκαν επιτυχώς`
                        : "Ο λογαριασμός πληρώθηκε επιτυχώς",
                });
                setSuccess(true)
                await refreshAccount()
            }
        } catch {
            setFeedback({
                type: "error",
                title: "Αποτυχία Πληρωμής",
                message: "Κάτι πήγε στραβά κατά την πληρωμή",
            });
            setError("Κάτι πήγε στραβά κατά την πληρωμή")
        } finally {
            setLoading(false)
            fetch("/mock-api/bills").then(
                res => res.json().then((data: Bill[]) => {
                    const foundBill = data.find((b: Bill) => b.rf === rfCode)
                    setBill(foundBill ?? null)
                })
            )
        }
    }

    return (
        <div>
            <PageHeader title="Πληρωμή Λογαριασμού" />


            {bill && (
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">Στοιχεία Λογαριασμού</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Πάροχος</p>
                                <p className="text-lg font-semibold">{bill.provider}</p>
                            </div>

                            <div>
                                <p className="text-gray-600">RF Κωδικός</p>
                                <p className="text-lg font-semibold">{bill.rf}</p>
                            </div>

                            <div>
                                <p className="text-gray-600">Ποσό</p>
                                <p className="text-lg font-semibold">{formatCurrency(bill.amount, bill.currency)}</p>
                            </div>

                            <div>
                                <p className="text-gray-600">Προθεσμία Πληρωμής</p>
                                {/* <p>{bill.dueDate.toString()}</p> */}
                                <p className="text-lg font-semibold">{formatDate(bill.due_date)}</p>
                            </div>

                            <div>
                                <p className="text-gray-600">Κατηγορία</p>
                                <p className="text-lg font-semibold capitalize">{bill.category}</p>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-gray-600">Κατάσταση</p>
                                    {bill.status === "paid" ? <p className="text-lg font-semibold text-green-600">Πληρωμένο</p> : <p className="text-lg font-semibold text-yellow-600">Εκκρεμεί</p>}
                                </div>
                                <button
                                    onClick={handlePayment}
                                    disabled={loading || success}
                                    className={`py-2 px-4 rounded-lg font-semibold text-white transition-colors whitespace-nowrap ${loading || success
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-action-blue active:bg-action-blue-hover"
                                        }`}
                                >
                                    {loading ? "Επεξεργασία..." : success ? "Πληρωμένο" : "Πληρωμή"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!bill && !error && (
                <div className="text-center text-gray-500">
                    Φόρτωση στοιχείων λογαριασμού...
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
    )
}