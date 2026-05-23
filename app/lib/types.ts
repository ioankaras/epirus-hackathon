export interface Account {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type: "debit" | "credit";
  description: string;
  amount: number;
  currency: string;
  date: string;
  recipient?: string;
  accountId?: string;
}

export interface Contact {
  id: string;
  name: string;
  accountNumber: string;
  initials: string;
}

export interface Bill {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "unpaid" | "paid";
  category: "Ρεύμα" | "Νερό" | "Τηλεφωνία" | "internet" | "Καύσιμα";
  rf: string;
}
