import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { Achievement } from '../../../../shared/models/achievement.model';

@Component({
  selector: 'app-achievement-card',
  standalone: true,
  imports: [CommonModule, NgbTooltip],
  templateUrl: './achievement-card.component.html',
  styleUrls: ['./achievement-card.component.scss'],
})
export class AchievementCardComponent implements OnInit {
  @Input() achievement!: Achievement;

  // Property to track if this is a newly unlocked achievement
  isNewlyUnlocked = false;

  // Calculate the time difference from now to unlocked time
  timeAgo = '';

  ngOnInit(): void {
    // Check if this achievement was unlocked recently (within the last 5 minutes)
    if (this.achievement.isUnlocked && this.achievement.unlockedAt) {
      const unlockedTime = new Date(this.achievement.unlockedAt).getTime();
      const now = new Date().getTime();
      const differenceMs = now - unlockedTime;

      // If the achievement was unlocked less than 5 minutes ago, mark it as newly unlocked
      this.isNewlyUnlocked = differenceMs < 300000; // 5 minutes in milliseconds

      // Calculate time ago string
      this.calculateTimeAgo(differenceMs);
    }
  }

  calculateTimeAgo(differenceMs: number): void {
    const seconds = Math.floor(differenceMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      this.timeAgo = `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      this.timeAgo = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      this.timeAgo = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      this.timeAgo = 'Just now';
    }
  }

  getIconClass(): string {
    // Map achievement icon name to Bootstrap icon class
    const iconMap: { [key: string]: string } = {
      'level-5': 'award',
      'level-10': 'award-fill',
      'level-25': 'trophy',
      'level-50': 'trophy-fill',
      'tasks-10': 'check-circle',
      'tasks-50': 'check-circle-fill',
      'tasks-100': 'check-all',
      'tasks-500': 'check-all',
      'equipment-5': 'box',
      'equipment-15': 'boxes',
    };

    // Return the mapped icon or a default one
    return iconMap[this.achievement.icon] || 'star-fill';
  }

  getTypeClass(): string {
    if (this.achievement.icon.includes('level')) {
      return 'achievement-level';
    } else if (this.achievement.icon.includes('tasks')) {
      return 'achievement-tasks';
    } else if (this.achievement.icon.includes('equipment')) {
      return 'achievement-equipment';
    } else {
      return 'achievement-special';
    }
  }
}
