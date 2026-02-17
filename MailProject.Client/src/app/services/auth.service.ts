import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private dataService: DataService, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    if (token) {
      this.currentUserSubject.next({ token, name, email, role });
    }
  }

  login(credentials: any): Observable<any> {
    return this.dataService.post('auth/login', credentials).pipe(
      tap((res: any) => {
        if (res.isSuccess) {
          localStorage.setItem('token', res.data.token);
          // Store user details for Navbar
          if (res.data.name) localStorage.setItem('userName', res.data.name);
          if (res.data.email) localStorage.setItem('userEmail', res.data.email);
          if (res.data.role) localStorage.setItem('userRole', res.data.role);
          this.currentUserSubject.next(res.data);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.dataService.post('auth/register', userData);
  }

  verifyEmail(email: string, code: string): Observable<any> {
    return this.dataService.post('auth/verify-email', { email, code });
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.dataService.post(`auth/resend-code?email=${email}`, {});
  }

  forgotPassword(email: string): Observable<any> {
    return this.dataService.post(`auth/forgot-password?email=${email}`, {});
  }

  resetPassword(data: any): Observable<any> {
    return this.dataService.post('auth/reset-password', data);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }
}
