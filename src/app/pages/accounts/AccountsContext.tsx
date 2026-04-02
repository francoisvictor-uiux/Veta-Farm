import React, { createContext, useContext, useState, useMemo } from 'react'
import type { 
  Account, JournalEntry, CostCenter, Currency, 
  Asset, BankAccount, Treasury 
} from '../../types/accounts'

// Mocks
import { 
  CHART_OF_ACCOUNTS, JOURNAL_ENTRIES, COST_CENTERS, 
  CURRENCIES, ASSETS, BANK_ACCOUNTS, TREASURIES,
  MOCK_CUSTOMERS, MOCK_SUPPLIERS
} from '../../data/accountsData'

interface AccountsContextType {
  accounts: Account[]
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>
  entries: JournalEntry[]
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>
  costCenters: CostCenter[]
  setCostCenters: React.Dispatch<React.SetStateAction<CostCenter[]>>
  currencies: Currency[]
  assets: Asset[]
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>
  bankAccounts: BankAccount[]
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>
  treasuries: Treasury[]
  setTreasuries: React.Dispatch<React.SetStateAction<Treasury[]>>

  customers: { id: string, name: string }[]
  suppliers: { id: string, name: string }[]

  // Shared generic actions that manipulate balances across state (Frontend Mock Only)
  postJournalEntry: (entry: JournalEntry) => void
}

const AccountsContext = createContext<AccountsContextType | null>(null)

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(CHART_OF_ACCOUNTS)
  const [entries, setEntries] = useState<JournalEntry[]>(JOURNAL_ENTRIES)
  const [costCenters, setCostCenters] = useState<CostCenter[]>(COST_CENTERS)
  const [assets, setAssets] = useState<Asset[]>(ASSETS)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(BANK_ACCOUNTS)
  const [treasuries, setTreasuries] = useState<Treasury[]>(TREASURIES)

  // We could add state for Customers/Suppliers but for now reading from mock is ok
  const customers = MOCK_CUSTOMERS
  const suppliers = MOCK_SUPPLIERS
  const currencies = CURRENCIES

  const postJournalEntry = (entry: JournalEntry) => {
    // 1. Add Entry
    setEntries(prev => [entry, ...prev])

    // 2. Adjust Account Balances
    // Note: This is an oversimplified front-end balance calculation logic. 
    // Usually backend does this securely by applying debits and credits correctly based on natural balance.
    setAccounts(prev => prev.map(acc => {
      let netChange = 0
      entry.lines.forEach(line => {
        if (line.accountId === acc.id) {
          if (acc.nature === 'debit') {
            netChange += (line.debit - line.credit)
          } else {
            netChange += (line.credit - line.debit)
          }
        }
      })

      if (netChange !== 0) {
        return { ...acc, balance: acc.balance + netChange }
      }
      return acc
    }))
  }

  return (
    <AccountsContext.Provider value={{
      accounts, setAccounts,
      entries, setEntries,
      costCenters, setCostCenters,
      currencies,
      assets, setAssets,
      bankAccounts, setBankAccounts,
      treasuries, setTreasuries,
      customers, suppliers,
      postJournalEntry,
    }}>
      {children}
    </AccountsContext.Provider>
  )
}

export function useAccounts() {
  const ctx = useContext(AccountsContext)
  if (!ctx) throw new Error('useAccounts must be used within AccountsProvider')
  return ctx
}
