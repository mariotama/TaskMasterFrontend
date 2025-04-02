import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { WalletService } from '../../../shared/services/wallet.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  private authService = inject(AuthService);
  private walletService = inject(WalletService);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  coins = signal<number>(0);

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.loadWallet();
    }

    // Also subscribe to authentication changes to update the wallet when needed
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.loadWallet();
      } else {
        this.coins.set(0);
      }
    });
  }

  loadWallet(): void {
    this.walletService.getWallet().subscribe({
      next: (wallet) => {
        this.coins.set(wallet.coins);
      },
      error: (error) => {
        console.error('Error loading wallet:', error);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
