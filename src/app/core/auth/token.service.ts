import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  setToken(token: string): void {
    console.log(
      'Setting token:',
      token ? `${token.substring(0, 10)}...` : 'null'
    );
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log(
      'Getting token:',
      token ? `${token.substring(0, 10)}...` : 'null'
    );
    return token;
  }

  removeToken(): void {
    console.log('Removing token');
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    const hasToken = !!this.getToken();
    console.log('Checking if token exists:', hasToken);
    return hasToken;
  }
}
