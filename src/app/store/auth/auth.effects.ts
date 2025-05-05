import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { TokenService } from '../../core/auth/token.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$: Actions = inject(Actions);
  private authService: AuthService = inject(AuthService);
  private tokenService: TokenService = inject(TokenService);
  private router: Router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, username, password }) =>
        this.authService.login({ email, username, password }).pipe(
          map((response) =>
            AuthActions.loginSuccess({
              user: response.user,
              token: response.token,
            })
          ),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ token }) => {
          this.tokenService.setToken(token);
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ username, email, password }) =>
        this.authService.register({ username, email, password }).pipe(
          map((response) =>
            AuthActions.registerSuccess({
              user: response.user,
              token: response.token,
            })
          ),
          catchError((error) => of(AuthActions.registerFailure({ error })))
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(({ token }) => {
          this.tokenService.setToken(token);
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      exhaustMap(() =>
        this.authService.loadUserProfile().pipe(
          map((user) => AuthActions.loadUserSuccess({ user })),
          catchError((error) => of(AuthActions.loadUserFailure({ error })))
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.tokenService.removeToken();
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );
}
