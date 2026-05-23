"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Account, Transaction, Contact, Bill } from "@/lib/types";

interface BankState {
  account: Account | null;
  transactions: Transaction[];
  contacts: Contact[];
  bills: Bill[];
  loading: boolean;
  refreshAccount: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshBills: () => Promise<void>;
}

const BankContext = createContext<BankState>({
  account: null,
  transactions: [],
  contacts: [],
  bills: [],
  loading: true,
  refreshAccount: async () => {},
  refreshTransactions: async () => {},
  refreshBills: async () => {},
});

export function useBankContext() {
  return useContext(BankContext);
}

export default function BankProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAccount = useCallback(async () => {
    const res = await fetch("/mock-api/accounts");
    const data = await res.json();
    setAccount(data[0]);
  }, []);

  const refreshTransactions = useCallback(async () => {
    const res = await fetch("/mock-api/transactions");
    const data = await res.json();
    setTransactions(data);
  }, []);

  const refreshBills = useCallback(async () => {
    const res = await fetch("/mock-api/bills");
    const data = await res.json();
    setBills(data);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [accRes, txRes, contactsRes, billsRes] = await Promise.all([
          fetch("/mock-api/accounts"),
          fetch("/mock-api/transactions"),
          fetch("/mock-api/contacts"),
          fetch("/mock-api/bills"),
        ]);
        const [accData, txData, contactsData, billsData] = await Promise.all([
          accRes.json(),
          txRes.json(),
          contactsRes.json(),
          billsRes.json(),
        ]);
        setAccount(accData[0]);
        setTransactions(txData);
        setContacts(contactsData);
        setBills(billsData);
      } catch {
        // Data will be served by API routes
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <BankContext.Provider
      value={{
        account,
        transactions,
        contacts,
        bills,
        loading,
        refreshAccount,
        refreshTransactions,
        refreshBills,
      }}
    >
      {children}
    </BankContext.Provider>
  );
}
