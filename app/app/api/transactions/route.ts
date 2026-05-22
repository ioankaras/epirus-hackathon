import { transactions, account, contacts } from "@/lib/mock-data";

export async function GET() {
  return Response.json({ transactions });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { recipientId, amount, description } = body;

  const contact = contacts.find((c) => c.id === recipientId);
  if (!contact) {
    return Response.json({ success: false, error: "Contact not found" }, { status: 400 });
  }

  if (amount <= 0 || amount > account.balance) {
    return Response.json({ success: false, error: "Invalid amount" }, { status: 400 });
  }

  const newTransaction = {
    id: `TXN-${Date.now()}`,
    type: "debit" as const,
    description: description || `Transfer to ${contact.name}`,
    amount,
    currency: account.currency,
    date: new Date().toISOString(),
    recipient: contact.name,
  };

  transactions.unshift(newTransaction);
  account.balance -= amount;
  account.lastUpdated = new Date().toISOString();

  return Response.json({
    success: true,
    transaction: newTransaction,
    newBalance: account.balance,
  });
}
