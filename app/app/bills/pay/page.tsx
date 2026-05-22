"use client";

import PageHeader from "@/components/ui/PageHeader";
import { useSearchParams } from "next/navigation";

export default function BillPay() {
    const searchParams = useSearchParams()

    const rfCode = searchParams.get("code")

    return (
        <div>
            <PageHeader title="Pay Bill" />

            <div>
                {rfCode}
            </div>
        </div>
    )
}