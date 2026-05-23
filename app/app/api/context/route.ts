import { account, transactions, bills, contacts } from "@/lib/mock-data";

export async function GET() {
  const unpaidBills = bills.filter((b) => b.status === "unpaid");
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  const recentTransactions = transactions.slice(0, 10);

  const nextDueBill = unpaidBills.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  )[0];

  return Response.json({
    account: {
      id: account.id,
      holderName: account.name,
      iban: account.accountNumber,
      balance: account.balance,
      currency: account.currency,
      lastUpdated: account.lastUpdated,
    },
    transactions: recentTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      description: t.description,
      amount: t.amount,
      currency: t.currency,
      date: t.date,
      recipient: t.recipient ?? null,
    })),
    bills: {
      unpaid: unpaidBills.map((b) => ({
        id: b.id,
        provider: b.provider,
        amount: b.amount,
        currency: b.currency,
        dueDate: b.dueDate,
        category: b.category,
        rf: b.rf,
      })),
      totalUnpaid: Math.round(totalUnpaid * 100) / 100,
      nextDue: nextDueBill
        ? { provider: nextDueBill.provider, dueDate: nextDueBill.dueDate, amount: nextDueBill.amount }
        : null,
    },
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name,
      iban: c.accountNumber,
    })),
    summary: {
      balanceFormatted: `€${account.balance.toLocaleString("el-GR", { minimumFractionDigits: 2 })}`,
      unpaidBillsCount: unpaidBills.length,
      totalUnpaidFormatted: `€${totalUnpaid.toLocaleString("el-GR", { minimumFractionDigits: 2 })}`,
      nextDueSummary: nextDueBill
        ? `${nextDueBill.provider} — €${nextDueBill.amount} due ${nextDueBill.dueDate}`
        : "No pending bills",
      contactCount: contacts.length,
    },
  });
}
