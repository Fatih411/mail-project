import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">E-Posta Doğrulama</h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Lütfen e-posta adresinize ({{email}}) gönderilen 6 haneli doğrulama kodunu giriniz.
        </p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" (ngSubmit)="onSubmit()">
          <div>
            <label for="code" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Doğrulama Kodu</label>
            <div class="mt-2 relative">
               <input id="code" name="code" type="text" required [(ngModel)]="code" maxlength="6" class="block w-full rounded-md border-0 py-1.5 text-center text-2xl tracking-widest text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:leading-6">
            </div>
          </div>

          <div class="flex gap-x-4">
                      <button type="submit" 
                        [disabled]="!code"
                        [ngClass]="{'opacity-50 cursor-not-allowed': !code, 'hover:bg-indigo-500 hover:scale-[1.02]': code}"
                        class="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 transform">
                        Doğrula
                    </button>
                    <button type="button" (click)="resendCode()" 
                        class="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-300 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600">
                        Tekrar Gönder
                    </button>
          </div>
        </form>
        
      </div>
    </div>
  `
})
export class VerifyEmailComponent {
  email = '';
  code = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  onSubmit() {
    if (this.code.length !== 6) {
      this.toastr.warning('Lütfen 6 haneli kodu giriniz.', 'Uyarı');
      return;
    }
    this.authService.verifyEmail(this.email, this.code).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.success('E-posta başarıyla doğrulandı! Giriş yapabilirsiniz.', 'Başarılı');
          this.router.navigate(['/login']);
        } else {
          this.toastr.error(res.message || 'Doğrulama başarısız', 'Hata');
        }
      },
      error: (err) => { /* Interceptor */ }
    });
  }

  resendCode() {
    if (!this.email) {
      this.toastr.warning('E-posta adresi bulunamadı.', 'Uyarı');
      return;
    }
    this.authService.resendVerificationCode(this.email).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.info('Yeni kod gönderildi. Lütfen e-postanızı kontrol edin.', 'Bilgi');
        } else {
          this.toastr.error(res.message, 'Hata');
        }
      },
      error: (err) => { /* Interceptor */ }
    });
  }
}
