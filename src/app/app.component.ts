import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'TaskMaster';

  ngOnInit(): void {
    // Preload sound effects
    this.preloadSoundEffects();
  }

  /**
   * Preload sound effects to reduce latency
   */
  private preloadSoundEffects(): void {
    const soundEffects = [
      'success.mp3',
      'error.mp3',
      'warning.mp3',
      'info.mp3',
      'achievement.mp3',
      'level-up.mp3',
      'coin.mp3',
      'task-complete.mp3',
    ];

    // Create audio elements for each sound but don't play them
    soundEffects.forEach((sound) => {
      try {
        const audio = new Audio(`assets/sounds/${sound}`);
        audio.load();
      } catch (error) {
        console.warn(`Could not preload sound: ${sound}`, error);
      }
    });
  }
}
