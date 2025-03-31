/**
 * Enum for transaction types
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/**
 * Interface representing a user's wallet
 */
export interface Wallet {
  id: number;
  coins: number;
  userId: number;
}

/**
 * Interface representing a financial transaction
 */
export interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: TransactionType;
  createdAt: Date;
}
