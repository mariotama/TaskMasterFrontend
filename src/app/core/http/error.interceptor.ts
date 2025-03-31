import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../auth/token.service';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor that handles HTTP errors
 * Redirects to login on 401 errors
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If Unauthorized (401), redirect to login
      if (error.status === 401) {
        tokenService.removeToken();
        router.navigate(['/auth/login']);
      }

      // Return the error for further handling
      return throwError(() => error);
    })
  );
};
