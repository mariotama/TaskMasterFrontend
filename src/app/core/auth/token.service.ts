import { Injectable } from '@angular/core';

/**
 * Service to handle JWT token storage and retrieval
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  /**
   * Sets the authentication token in localStorage
   * @param token The JWT token
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Gets the authentication token from localStorage
   * @returns The JWT token or null if not found
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Removes the authentication token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Checks if a token exists in localStorage
   * @returns True if a token exists
   */
  hasToken(): boolean {
    return !!this.getToken();
  }
}
