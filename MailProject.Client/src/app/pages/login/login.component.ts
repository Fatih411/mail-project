import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from '../../core/constants/app.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{{ appName }}</h2>
        <h2 class="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">Hoşgeldiniz</h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Hesabınıza giriş yaparak panelinize erişin.
        </p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" (ngSubmit)="onSubmit()">
          
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">E-Posta Adresi</label>
            <div class="mt-2 relative rounded-md shadow-sm">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
              </div>
              <input type="email" name="email" id="email" [(ngModel)]="email" required class="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200" placeholder="ornek@sirket.com">
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Şifre</label>
              <div class="text-sm">
                <a href="/forgot-password" class="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Şifremi Unuttum?</a>
              </div>
            </div>
            <div class="mt-2 relative rounded-md shadow-sm">
               <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                 <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                   <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                 </svg>
               </div>
              <input [type]="showPassword ? 'text' : 'password'" name="password" id="password" [(ngModel)]="password" required class="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200" placeholder="••••••••">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" (click)="togglePassword()">
                  <svg *ngIf="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="!email || !password" 
                [ngClass]="{'opacity-50 cursor-not-allowed': !email || !password, 'hover:bg-indigo-500 hover:scale-[1.02]': email && password}"
                class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 transform">
                Giriş Yap
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Henüz hesabınız yok mu?
          <a href="/register" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Şimdi Kaydolun</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  appName = AppConstants.appName;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) { }

  onSubmit() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.toastr.success('Giriş başarılı!', 'Hoşgeldiniz');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        if (err.status === 403 || err.error?.message === "Email not verified") {
          this.toastr.warning('E-posta adresiniz doğrulanmamış. Doğrulama sayfasına yönlendiriliyorsunuz.', 'Uyarı');
          this.router.navigate(['/verify-email'], { queryParams: { email: this.email } });
        }
        // Other errors handled by interceptor
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
