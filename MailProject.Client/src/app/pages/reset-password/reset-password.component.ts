import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from '../../core/constants/app.constants';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{{ appName }}</h2>
        <h2 class="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">Yeni Şifre Belirle</h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Kodu ve yeni şifrenizi girin.
        </p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" (ngSubmit)="onSubmit()">
          
          <!-- Code -->
          <div>
            <label for="code" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Sıfırlama Kodu</label>
            <div class="mt-2">
              <input type="text" name="code" id="code" [(ngModel)]="token" required class="block w-full rounded-md border-0 py-2.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200">
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label for="newPassword" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Yeni Şifre</label>
            <div class="mt-2">
              <input type="password" name="newPassword" id="newPassword" [(ngModel)]="newPassword" required class="block w-full rounded-md border-0 py-2.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200">
            </div>
          </div>

          <!-- Confirm New Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Yeni Şifre Tekrar</label>
            <div class="mt-2">
              <input type="password" name="confirmPassword" id="confirmPassword" [(ngModel)]="confirmPassword" required class="block w-full rounded-md border-0 py-2.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200">
            </div>
            <p *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword" class="mt-1 text-xs text-red-500">Şifreler eşleşmiyor.</p>
          </div>

          <div>
            <button type="submit" 
               [disabled]="!token || !newPassword || !confirmPassword || newPassword !== confirmPassword"
               [ngClass]="{'opacity-50 cursor-not-allowed': !token || !newPassword || !confirmPassword || newPassword !== confirmPassword, 'hover:bg-indigo-500 hover:scale-[1.02]': token && newPassword && confirmPassword && newPassword === confirmPassword}"
               class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 transform">
                Şifreyi Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';
  appName = AppConstants.appName;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  onSubmit() {
    if (!this.email || !this.token || !this.newPassword || !this.confirmPassword) {
      this.toastr.warning('Lütfen tüm alanları doldurun.', 'Uyarı');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Şifreler eşleşmiyor.', 'Hata');
      return;
    }

    const data = {
      email: this.email,
      token: this.token,
      newPassword: this.newPassword
    };

    this.authService.resetPassword(data).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.success('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.', 'Başarılı');
          this.router.navigate(['/login']);
        } else {
          this.toastr.error(res.message || 'Şifre sıfırlama başarısız.', 'Hata');
        }
      },
      error: (err) => { /* Handled by interceptor */ }
    });
  }
}
