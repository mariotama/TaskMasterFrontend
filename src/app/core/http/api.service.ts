import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Base service for API communication
 * Provides generic methods for HTTP requests
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private buildUrl(endpoint: string): string {
    return `${this.apiUrl}/${endpoint}`;
  }

  /**
   * Performs a GET request to the API
   * @param endpoint The API endpoint to call
   * @param params Optional query parameters
   * @returns Observable with the response
   */
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), { params });
  }

  /**
   * Performs a POST request to the API
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns Observable with the response
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), data);
  }

  /**
   * Performs a PUT request to the API
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns Observable with the response
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), data);
  }

  /**
   * Performs a PATCH request to the API
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns Observable with the response
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), data);
  }

  /**
   * Performs a DELETE request to the API
   * @param endpoint The API endpoint to call
   * @returns Observable with the response
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint));
  }
}
