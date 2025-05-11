import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/http/api.service';
import { Achievement } from '../../../../shared/models/achievement.model';
import { AchievementCardComponent } from '../../components/achievement-card/achievement-card.component';
import { AchievementFilterPipe } from '../../pipes/achievement-filter.pipe';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, AchievementCardComponent, AchievementFilterPipe],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent implements OnInit {
  private apiService = inject(ApiService);

  achievements = signal<Achievement[]>([]);
  isLoading = signal(true);
  currentFilter = signal('all');

  stats = signal<{
    total: number;
    unlocked: number;
    percentage: number;
  }>({
    total: 0,
    unlocked: 0,
    percentage: 0,
  });

  // Method for obtaining stats achievements
  levelTotal = computed(() => this.countAchievements('level'));
  levelUnlocked = computed(() => this.countAchievements('level', true));

  tasksTotal = computed(() => this.countAchievements('tasks'));
  tasksUnlocked = computed(() => this.countAchievements('tasks', true));

  equipmentTotal = computed(() => this.countAchievements('equipment'));
  equipmentUnlocked = computed(() => this.countAchievements('equipment', true));

  // Special category
  specialTotal = computed(() => {
    return this.achievements().filter(
      (a) =>
        !a.icon.includes('level') &&
        !a.icon.includes('tasks') &&
        !a.icon.includes('equipment')
    ).length;
  });

  specialUnlocked = computed(() => {
    return this.achievements().filter(
      (a) =>
        !a.icon.includes('level') &&
        !a.icon.includes('tasks') &&
        !a.icon.includes('equipment') &&
        a.isUnlocked
    ).length;
  });

  ngOnInit(): void {
    this.loadAchievements();
  }

  private countAchievements(
    category: string,
    onlyUnlocked: boolean = false
  ): number {
    if (onlyUnlocked) {
      return this.achievements().filter(
        (a) => a.icon.includes(category) && a.isUnlocked
      ).length;
    } else {
      return this.achievements().filter((a) => a.icon.includes(category))
        .length;
    }
  }

  loadAchievements(): void {
    this.apiService.get<Achievement[]>('achievement').subscribe({
      next: (data) => {
        const sortedData = data.sort((a, b) => {
          if (a.isUnlocked !== b.isUnlocked) {
            return a.isUnlocked ? -1 : 1;
          }

          const getCategoryOrder = (achievement: Achievement) => {
            if (
              achievement.name.includes('Level') ||
              achievement.name.includes('Apprentice') ||
              achievement.name.includes('Expert') ||
              achievement.name.includes('Master') ||
              achievement.name.includes('Beginner')
            )
              return 1;
            if (
              achievement.name.includes('Complete') ||
              achievement.name.includes('Productive') ||
              achievement.name.includes('Worker') ||
              achievement.name.includes('Unstoppable') ||
              achievement.name.includes('Legend')
            )
              return 2;
            if (
              achievement.name.includes('Collector') ||
              achievement.name.includes('Armory') ||
              achievement.name.includes('Buy') ||
              achievement.name.includes('equipment')
            )
              return 3;
            return 4;
          };

          const categoryA = getCategoryOrder(a);
          const categoryB = getCategoryOrder(b);

          if (categoryA !== categoryB) return categoryA - categoryB;

          const getAchievementOrder = (achievement: Achievement) => {
            if (achievement.name === 'Beginner') return 5;
            if (achievement.name === 'Apprentice') return 10;
            if (achievement.name === 'Expert') return 25;
            if (achievement.name === 'Master') return 50;

            if (achievement.name === 'Productive') return 10;
            if (achievement.name === 'Worker') return 50;
            if (achievement.name === 'Unstoppable') return 100;
            if (achievement.name === 'Legend') return 500;

            if (achievement.name === 'Collector') return 5;
            if (achievement.name === 'Armory') return 15;

            const match = achievement.name.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };

          const orderA = getAchievementOrder(a);
          const orderB = getAchievementOrder(b);

          return orderA - orderB;
        });

        this.achievements.set(sortedData);
        this.calculateStats(sortedData);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading achievements', error);
        this.isLoading.set(false);
      },
    });
  }

  calculateStats(achievements: Achievement[]): void {
    const total = achievements.length;
    const unlocked = achievements.filter((a) => a.isUnlocked).length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    this.stats.set({
      total,
      unlocked,
      percentage,
    });
  }

  setFilter(filter: string): void {
    this.currentFilter.set(filter);
  }

  refreshAchievements(): void {
    this.isLoading.set(true);
    this.apiService.post('achievement/check', {}).subscribe({
      next: (response: any) => {
        // If achievements were unlocked, show appropriate feedback
        if (response.unlockedCount > 0) {
          // In a real app, you might want to show a toast notification here
          console.log(`${response.unlockedCount} achievements unlocked!`);
        }
        // Reload achievements to get the updated list
        this.loadAchievements();
      },
      error: (error) => {
        console.error('Error checking achievements', error);
        this.isLoading.set(false);
      },
    });
  }
}
