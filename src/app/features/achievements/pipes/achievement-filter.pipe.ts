import { Pipe, PipeTransform } from '@angular/core';
import { Achievement } from '../../../shared/models/achievement.model';

@Pipe({
  name: 'achievementFilter',
  standalone: true,
})
export class AchievementFilterPipe implements PipeTransform {
  transform(achievements: Achievement[], filter: string): Achievement[] {
    if (!achievements || !filter) {
      return achievements;
    }

    switch (filter) {
      case 'unlocked':
        return achievements.filter((achievement) => achievement.isUnlocked);
      case 'locked':
        return achievements.filter((achievement) => !achievement.isUnlocked);
      default:
        return achievements;
    }
  }
}
