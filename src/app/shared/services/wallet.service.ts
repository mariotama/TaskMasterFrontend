import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/http/api.service';
import { Transaction, Wallet } from '../../shared/models/wallet.model';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private apiService = inject(ApiService);

  /**
   * Get user's wallet information
   */
  getWallet(): Observable<Wallet> {
    return this.apiService.get<Wallet>('wallet');
  }

  /**
   * Get user's transaction history
   * @param page Page number
   * @param limit Items per page
   */
  getTransactions(
    page = 1,
    limit = 10
  ): Observable<{
    transactions: Transaction[];
    total: number;
  }> {
    return this.apiService.get<{
      transactions: Transaction[];
      total: number;
    }>('wallet/transactions', { page, limit });
  }

  /**
   * Get a summary of the user's wallet activity
   */
  getWalletSummary(): Observable<{
    currentBalance: number;
    recentTransactions: Transaction[];
    summary: {
      totalIncome: number;
      totalExpense: number;
      net: number;
    };
  }> {
    return this.apiService.get<{
      currentBalance: number;
      recentTransactions: Transaction[];
      summary: {
        totalIncome: number;
        totalExpense: number;
        net: number;
      };
    }>('wallet/summary');
  }
}
