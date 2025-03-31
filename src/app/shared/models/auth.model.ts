import { User } from './user.model';

/**
 * Interface for login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface for registration credentials
 */
export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

/**
 * Interface for the authentication response
 */
export interface AuthResponse {
  user: User;
  token: string;
}
