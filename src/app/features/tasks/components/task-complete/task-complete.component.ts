import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  @Output() close = new EventEmitter<void>();

  showModal = false;
  coinAnimationComplete = false;
  xpAnimationComplete = false;

  ngOnInit(): void {
    this.startAnimationSequence();

    // Show notification
    this.notificationService.success(`Task completed: ${this.taskName}`);

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

  onClose(): void {
    this.showModal = false;
    this.close.emit(); // Emit the close event to parent
  }
}
