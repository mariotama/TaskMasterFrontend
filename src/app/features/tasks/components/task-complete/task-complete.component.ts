import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressionResult } from '../../../../shared/models/progression.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-task-complete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-complete.component.html',
  styleUrls: ['./task-complete.component.scss'],
})
export class TaskCompleteComponent implements OnInit {
  private notificationService = inject(NotificationService);

  @Input() result!: ProgressionResult;
  @Input() taskName: string = '';

  showModal = false;
  coinAnimationComplete = false;
  xpAnimationComplete = false;

  ngOnInit(): void {
    this.startAnimationSequence();

    // Play completion sound
    this.playCompletionSound();

    // Show notification
    this.notificationService.success(`Task completed: ${this.taskName}`, {
      soundEffect: false, // Already playing the completion sound
    });

    // Check for achievements
    if (
      this.result.unlockedAchievements &&
      this.result.unlockedAchievements.length > 0
    ) {
      // Delay achievement notifications to not overwhelm the user
      setTimeout(() => {
        this.result.unlockedAchievements.forEach((achievement, index) => {
          setTimeout(() => {
            this.notificationService.achievementUnlocked(achievement.name);
          }, index * 2000); // Show each achievement notification 2 seconds apart
        });
      }, 1500); // Start after initial completion notification
    }
  }

  startAnimationSequence(): void {
    // Show the modal
    this.showModal = true;

    // Set up animation sequence timers
    setTimeout(() => {
      this.coinAnimationComplete = true;
    }, 2000);

    setTimeout(() => {
      this.xpAnimationComplete = true;
    }, 3500);
  }

  playCompletionSound(): void {
    try {
      const audio = new Audio('assets/sounds/task-complete.mp3');
      audio.volume = 0.5; // 50% volume
      audio.play().catch((error) => {
        console.warn('Could not play completion sound:', error);
      });
    } catch (error) {
      console.warn('Error playing completion sound:', error);
    }
  }

  close(): void {
    this.showModal = false;
  }
}
