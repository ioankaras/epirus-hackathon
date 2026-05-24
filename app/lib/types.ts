export interface Account {
  id: string;
  name: string;
  owner: string;
  accountNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type: "debit" | "credit" | "bill";
  description: string;
  amount: number;
  currency: string;
  date: string;
  recipient: string;
  accountId: string;
}

export interface Contact {
  id: string;
  name: string;
  accountNumber: string;
  accountId: string;
  initials: string;
}

export interface Bill {
  provider: string;
  amount: number;
  currency: string;
  due_date: string;
  status: "unpaid" | "paid";
  category: "Ρεύμα" | "Νερό" | "Τηλεφωνία" | "internet" | "Καύσιμα";
  rf: string;
}
