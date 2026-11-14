import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

export interface UserSession {
  userId: string;
  email: string;
  role: string;
  token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  // Default to gateway URL on port 3000 (can be overridden via window._env_ or proxy)
  private readonly apiUrl = 'http://localhost:3000';

  private readonly sessionState = signal<UserSession | null>(this.getStoredSession());

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionState()?.token);
  readonly currentUserRole = computed(() => this.sessionState()?.role || '');
  readonly currentUserEmail = computed(() => this.sessionState()?.email || '');

  private getStoredSession(): UserSession | null {
    try {
      const data = localStorage.getItem('asb_session');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res && res.success && res.token) {
            const session: UserSession = {
              userId: res.userId,
              email: res.email,
              role: res.role || 'developer',
              token: res.token,
            };
            this.setSession(session);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          let message = 'Failed to connect to authentication server.';
          if (error.status === 401) {
            message = error.error?.message || 'Invalid email or password.';
          } else if (error.status === 503) {
            message = 'Authentication service is temporarily unavailable.';
          } else if (error.error?.message) {
            message = error.error.message;
          }
          return throwError(() => new Error(message));
        }),
      );
  }

  setSession(session: UserSession): void {
    this.sessionState.set(session);
    try {
      localStorage.setItem('asb_session', JSON.stringify(session));
    } catch {
      // Ignored in storage-restricted environments
    }
  }

  logout(): void {
    this.sessionState.set(null);
    try {
      localStorage.removeItem('asb_session');
    } catch {
      // Ignored
    }
  }
}
