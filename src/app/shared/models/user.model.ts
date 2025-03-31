/**
 * Interface representing a user in the system
 */
export interface User {
  id: number;
  email: string;
  username: string;
  profileImageUrl?: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  createdAt: Date;
}
