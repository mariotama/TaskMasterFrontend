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

  // Métodos para obtener estadísticas de categorías
  levelTotal = computed(() => this.countAchievements('level'));
  levelUnlocked = computed(() => this.countAchievements('level', true));

  tasksTotal = computed(() => this.countAchievements('tasks'));
  tasksUnlocked = computed(() => this.countAchievements('tasks', true));

  equipmentTotal = computed(() => this.countAchievements('equipment'));
  equipmentUnlocked = computed(() => this.countAchievements('equipment', true));

  // Categoría especial (que no es ninguna de las anteriores)
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

  /**
   * Cuenta los logros de una categoría específica
   * @param category Categoría a buscar en el icono
   * @param onlyUnlocked Si solo se cuentan los desbloqueados
   */
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

  /**
   * Carga los logros desde el API
   */
  loadAchievements(): void {
    this.apiService.get<Achievement[]>('achievement').subscribe({
      next: (data) => {
        this.achievements.set(data);
        this.calculateStats(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading achievements', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Calcula las estadísticas generales de los logros
   */
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

  /**
   * Establece el filtro actual
   */
  setFilter(filter: string): void {
    this.currentFilter.set(filter);
  }

  /**
   * Verifica si hay nuevos logros para desbloquear
   */
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
