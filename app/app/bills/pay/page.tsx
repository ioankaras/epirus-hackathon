"use client";

import PageHeader from "@/components/ui/PageHeader";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { bills } from "@/lib/mock-data";
import { Bill } from "@/lib/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default function BillPay() {
    const searchParams = useSearchParams()
    const rfCode = searchParams.get("code")

    const [bill, setBill] = useState<Bill | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (rfCode) {
            const foundBill = bills.find((b) => b.rf === rfCode)
            if (foundBill) {
                queueMicrotask(() => {
                    setBill(foundBill)
                })
            } else {
                queueMicrotask(() => {
                    setError("Bill not found")
                })
            }
        }
    }, [rfCode])

    const handlePayment = async () => {
        if (!bill) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/bills", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ billId: bill.id }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Payment failed")
            } else {
                setSuccess(true)
            }
        } catch {
            setError("An error occurred during payment")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <PageHeader title="Pay Bill" />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Payment successful!
                </div>
            )}

            {bill && (
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">Bill Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Provider</p>
                                <p className="text-lg font-semibold">{bill.provider}</p>
                            </div>

                            <div>
                                <p className="text-gray-600">Reference Code</p>
                                <p className="text-lg font-semibold">{bill.rf}</p>
                            </div>

                            <div>
                                <p className="text-gray-600">Amount</p>
                                <p className="text-lg font-semibold">{formatCurrency(bill.amount, bill.currency)}</p>
                            </div>

                            <div>
                                <p className="text-gray-600">Due Date</p>
                                <p className="text-lg font-semibold">{formatDate(bill.dueDate)}</p>
                            </div>

                            <div>
                                <p className="text-gray-600">Category</p>
                                <p className="text-lg font-semibold capitalize">{bill.category}</p>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-gray-600">Status</p>
                                    <p className="text-lg font-semibold capitalize text-yellow-600">{bill.status}</p>
                                </div>
                                <button
                                    onClick={handlePayment}
                                    disabled={loading || success}
                                    className={`py-2 px-4 rounded-lg font-semibold text-white transition-colors whitespace-nowrap ${loading || success
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                                        }`}
                                >
                                    {loading ? "Processing..." : success ? "Complete" : "Pay"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!bill && !error && (
                <div className="text-center text-gray-500">
                    Loading bill information...
                </div>
            )}
        </div>
    )
}