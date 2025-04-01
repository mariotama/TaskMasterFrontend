import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XpProgressBarComponent } from '../../../../shared/components/xp-progress-bar/xp-progress-bar.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { ApiService } from '../../../../core/http/api.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-stats-card',
  standalone: true,
  imports: [CommonModule, XpProgressBarComponent],
  templateUrl: './user-stats-card.component.html',
  styleUrls: ['./user-stats-card.component.scss'],
})
export class UserStatsCardComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);

  user = signal<User | null>(null);
  userStats = signal<any>(null);
  walletInfo = signal<any>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    // Get current user from AuthService
    this.user.set(this.authService.currentUser());

    // Fetch user stats
    this.apiService.get('users/stats').subscribe({
      next: (data) => {
        this.userStats.set(data);
      },
      error: (error) => {
        console.error('Error loading user stats', error);
      },
    });

    // Fetch wallet info
    this.apiService.get('wallet').subscribe({
      next: (data) => {
        this.walletInfo.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading wallet info', error);
        this.isLoading.set(false);
      },
    });
  }
}
