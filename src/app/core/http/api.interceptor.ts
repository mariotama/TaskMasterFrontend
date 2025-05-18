import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Interceptor that adds the API base URL to all requests
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Only prefix requests that don't already have an absolute URL
  if (!req.url.startsWith('http')) {
    // Remove any leading slashes from the request URL
    const path = req.url.startsWith('/') ? req.url.substring(1) : req.url;

    // Create a new request with the full API URL
    const apiReq = req.clone({
      url: `${environment.apiUrl}/${path}`,
    });

    console.log('🌐 API Interceptor:', {
      original: req.url,
      final: apiReq.url,
    });

    return next(apiReq);
  }
  return next(req);
};
