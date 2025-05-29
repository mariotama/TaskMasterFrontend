import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface ApiWrapperResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Interceptor that unwraps API responses from the standard format
 * { success: boolean, data: T, timestamp: string } to just the data content
 */
export const responseTransformInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      // Only process HTTP responses
      if (event instanceof HttpResponse) {
        const body = event.body;

        // Verify if the body has the expected structure
        if (
          body &&
          typeof body === 'object' &&
          'success' in body &&
          'data' in body &&
          'timestamp' in body
        ) {
          // Extract the 'data' property
          const unwrappedData = body.data as { completions?: { task: any }[] };

          // Special handling for task completion history endpoint
          if (
            req.url.includes('tasks/history/completions') &&
            unwrappedData &&
            unwrappedData.completions
          ) {
            // Make sure completions have valid task data
            const validCompletions = unwrappedData.completions.filter(
              (c) => c && c.task
            );
            unwrappedData.completions = validCompletions;
          }

          // Create a new response with the unwrapped data
          return event.clone({ body: unwrappedData });
        }
      }

      // If the response is not in the expected format, return it as is
      return event;
    })
  );
};
