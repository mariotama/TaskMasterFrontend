// src/app/shared/services/level-up.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LevelUpService {
  private renderer: Renderer2;
  private levelUpOverlay: HTMLElement | null = null;

  // Observable to track when level up is showing
  private showingLevelUpSource = new BehaviorSubject<boolean>(false);
  showingLevelUp$ = this.showingLevelUpSource.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Show the level up animation
   * @param level The new level achieved
   * @param duration Time in ms to show the animation (default: 5000ms)
   */
  showLevelUp(level: number, duration: number = 5000): void {
    // If already showing, remove first
    if (this.levelUpOverlay) {
      this.hideLevelUp();
    }

    // Create overlay
    this.levelUpOverlay = this.renderer.createElement('div');
    this.renderer.addClass(this.levelUpOverlay, 'level-up-overlay');

    // Create content
    const content = this.renderer.createElement('div');
    this.renderer.addClass(content, 'level-up-content');

    // Create level up title
    const title = this.renderer.createElement('h1');
    this.renderer.addClass(title, 'level-up-title');
    this.renderer.setProperty(title, 'textContent', 'LEVEL UP!');

    // Create level display
    const levelDisplay = this.renderer.createElement('div');
    this.renderer.addClass(levelDisplay, 'level-display');
    this.renderer.setProperty(levelDisplay, 'textContent', `Level ${level}`);

    // Create message
    const message = this.renderer.createElement('p');
    this.renderer.addClass(message, 'level-up-message');
    this.renderer.setProperty(
      message,
      'textContent',
      "You've reached a new level!"
    );

    // Add all elements to the DOM
    this.renderer.appendChild(content, title);
    this.renderer.appendChild(content, levelDisplay);
    this.renderer.appendChild(content, message);
    this.renderer.appendChild(this.levelUpOverlay, content);
    this.renderer.appendChild(document.body, this.levelUpOverlay);

    // Add animation classes after a small delay to trigger animations
    setTimeout(() => {
      if (this.levelUpOverlay) {
        this.renderer.addClass(this.levelUpOverlay, 'show');
      }
    }, 50);

    // Update state
    this.showingLevelUpSource.next(true);

    // Auto-hide after duration
    setTimeout(() => this.hideLevelUp(), duration);

    // Add CSS if not already added
    this.addLevelUpStyles();
  }

  /**
   * Hide the level up animation
   */
  hideLevelUp(): void {
    if (this.levelUpOverlay) {
      // Add fade-out class
      this.renderer.addClass(this.levelUpOverlay, 'fade-out');

      // Remove from DOM after animation completes
      setTimeout(() => {
        if (this.levelUpOverlay) {
          this.renderer.removeChild(document.body, this.levelUpOverlay);
          this.levelUpOverlay = null;
          this.showingLevelUpSource.next(false);
        }
      }, 500); // Match the CSS animation duration
    }
  }

  /**
   * Add the necessary CSS styles for the level up animation
   */
  private addLevelUpStyles(): void {
    // Check if styles already exist
    if (document.getElementById('level-up-styles')) {
      return;
    }

    const styleEl = this.renderer.createElement('style');
    this.renderer.setAttribute(styleEl, 'id', 'level-up-styles');

    const css = `
      .level-up-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      
      .level-up-overlay.show {
        opacity: 1;
      }
      
      .level-up-overlay.fade-out {
        opacity: 0;
      }
      
      .level-up-content {
        text-align: center;
        color: white;
        animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .level-up-title {
        font-size: 3rem;
        color: #ffc107;
        text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
        margin-bottom: 1rem;
        animation: pulse 1s infinite alternate;
      }
      
      .level-display {
        font-size: 4rem;
        font-weight: bold;
        margin-bottom: 1rem;
        color: white;
      }
      
      .level-up-message {
        font-size: 1.5rem;
        color: #f8f9fa;
      }
      
      @keyframes scale-in {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); text-shadow: 0 0 10px rgba(255, 193, 7, 0.5); }
        100% { transform: scale(1.05); text-shadow: 0 0 20px rgba(255, 193, 7, 0.8); }
      }
    `;

    this.renderer.setProperty(styleEl, 'textContent', css);
    this.renderer.appendChild(document.head, styleEl);
  }
}
