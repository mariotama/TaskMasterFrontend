import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-xp-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xp-progress-bar.component.html',
  styleUrls: ['./xp-progress-bar.component.scss'],
})
export class XpProgressBarComponent {
  // Input signals for the component
  level = input.required<number>();
  currentXp = input.required<number>();
  xpToNextLevel = input.required<number>();
  showNextLevel = input<boolean>(true);

  // Computed signal for the progress percentage
  progressPercentage = computed(() => {
    if (this.xpToNextLevel() === 0) return 0;
    return Math.round((this.currentXp() / this.xpToNextLevel()) * 100);
  });
}
