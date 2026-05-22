import { bills, account, transactions } from "@/lib/mock-data";

export async function GET() {
  return Response.json({ bills });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { billId } = body;

  const bill = bills.find((b) => b.id === billId);
  if (!bill) {
    return Response.json({ success: false, error: "Bill not found" }, { status: 400 });
  }

  if (bill.status === "paid") {
    return Response.json({ success: false, error: "Bill already paid" }, { status: 400 });
  }

  if (bill.amount > account.balance) {
    return Response.json({ success: false, error: "Insufficient funds" }, { status: 400 });
  }

  bill.status = "paid";
  account.balance -= bill.amount;
  account.lastUpdated = new Date().toISOString();

  const newTransaction = {
    id: `TXN-${Date.now()}`,
    type: "debit" as const,
    description: `Payment - ${bill.provider}`,
    amount: bill.amount,
    currency: account.currency,
    date: new Date().toISOString(),
    recipient: bill.provider,
  };
  transactions.unshift(newTransaction);

  return Response.json({
    success: true,
    bill,
    newBalance: account.balance,
  });
}
