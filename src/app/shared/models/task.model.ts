/**
 * Enum for task types
 */
export enum TaskType {
  DAILY = 'daily',
  MISSION = 'mission',
}

/**
 * Interface representing a task
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  type: TaskType;
  isCompleted: boolean;
  xpReward: number;
  coinReward: number;
  dueDate?: Date;
  createdAt: Date;
}

/**
 * Interface representing a completed task record
 */
export interface TaskCompletion {
  id: number;
  completedAt: Date;
  xpEarned: number;
  coinsEarned: number;
  task: Task;
}
