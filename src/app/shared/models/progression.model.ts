/**
 * Interface representing the result of completing a task
 */
export interface ProgressionResult {
  xpGained: number;
  coinsGained: number;
  currentXp: number;
  xpToNextLevel: number;
  currentLevel: number;
  leveledUp: boolean;
  unlockedAchievements: {
    id: number;
    name: string;
    description: string;
    icon: string;
  }[];
}
