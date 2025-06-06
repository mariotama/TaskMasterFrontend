import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ApiService } from '../http/api.service';
import { TokenService } from './token.service';
import { User } from '../../shared/models/user.model';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../../shared/models/auth.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  // User state with Signals
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Check if token exists on startup and try to get user info
    if (this.tokenService.hasToken()) {
      this.loadUserProfile().subscribe({
        next: (user) => {
          console.log('User profile loaded successfully on initialization');
        },
        error: (error) => {
          // Token might be expired or invalid, clear it
          this.tokenService.removeToken();
          this.userSubject.next(null);
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
        },
      });
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', credentials).pipe(
      tap((response) => {
        this.handleAuth(response);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>('auth/register', credentials)
      .pipe(tap((response) => this.handleAuth(response)));
  }

  logout(): void {
    this.tokenService.removeToken();
    this.userSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  loadUserProfile(): Observable<User> {
    return this.apiService.get<User>('auth/me').pipe(
      tap((user) => {
        this.userSubject.next(user);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  private handleAuth(response: AuthResponse): void {
    if (!response || !response.token || !response.user) {
      console.error('Invalid auth response format:', response);
      return;
    }

    this.tokenService.setToken(response.token);
    this.userSubject.next(response.user);
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  /**
   * Updates the user information in memory.
   * Fix for the xp bar was not updating...
   */
  updateUserInfo(userUpdates: Partial<User>): void {
    // Obtain actual user
    const currentUserValue = this.currentUser();

    if (currentUserValue) {
      // Update only this fields
      const updatedUser = {
        ...currentUserValue,
        ...userUpdates,
      };

      // Update signal and BehaviorSubject
      this.currentUser.set(updatedUser);
      this.userSubject.next(updatedUser);
    }
  }
}
