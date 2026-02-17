import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from '../../core/constants/app.constants';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{{ appName }}</h2>
        <h2 class="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">Şifre Sıfırlama</h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            E-posta adresinizi girin, size bir sıfırlama kodu gönderelim.
        </p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" (ngSubmit)="onSubmit()">
          
          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">E-Posta Adresi</label>
            <div class="mt-2 relative rounded-md shadow-sm">
              <input type="email" name="email" id="email" [(ngModel)]="email" required class="block w-full rounded-md border-0 py-2.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200" placeholder="ornek@sirket.com">
            </div>
          </div>

          <div>
            <button type="submit" 
                [disabled]="!email"
                [ngClass]="{'opacity-50 cursor-not-allowed': !email, 'hover:bg-indigo-500 hover:scale-[1.02]': email}"
                class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 transform">
                Kod Gönder
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Hatırladınız mı?
          <a href="/login" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Giriş Yap</a>
        </p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  appName = AppConstants.appName;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) { }

  onSubmit() {
    if (!this.email) {
      this.toastr.warning('Lütfen e-posta adresinizi girin.', 'Uyarı');
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.success('Sıfırlama kodu gönderildi. Lütfen e-postanızı kontrol edin.', 'Başarılı');
          this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
        } else {
          this.toastr.error(res.message || 'Kod gönderilemedi.', 'Hata');
        }
      },
      error: (err) => { /* Handled by interceptor */ }
    });
  }
}
