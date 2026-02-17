import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PackageService } from '../../services/package.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from '../../core/constants/app.constants';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-10 text-center text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">{{ appName }}</h2>
        <h2 class="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">Hesap Oluşturun</h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Hemen başlayın ve kampanyalarınızı yönetin.
        </p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form class="space-y-6" (ngSubmit)="onSubmit()">
            
            <!-- Full Name -->
            <div>
            <label for="fullName" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Ad Soyad</label>
            <div class="mt-2 relative rounded-md shadow-sm">
                 <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                 </div>
              <input id="fullName" name="fullName" type="text" required [(ngModel)]="fullName" class="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200" placeholder="Adınız Soyadınız">
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">E-Posta Adresi</label>
            <div class="mt-2 relative rounded-md shadow-sm">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                </div>
              <input id="email" name="email" type="email" autocomplete="email" required [(ngModel)]="email" class="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200" placeholder="ornek@sirket.com">
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Şifre</label>
            <div class="mt-2 relative rounded-md shadow-sm">
              <input [type]="showPassword ? 'text' : 'password'" name="password" id="password" [(ngModel)]="password" required class="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200" placeholder="••••••••">
                <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                    <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
            </div>
          </div>

           <!-- Confirm Password -->
           <div>
              <label for="confirmPassword" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Şifre Tekrar</label>
              <div class="mt-2 relative rounded-md shadow-sm">
                <input [type]="showPassword ? 'text' : 'password'" name="confirmPassword" id="confirmPassword" [(ngModel)]="confirmPassword" required class="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white dark:focus:ring-indigo-500 transition-all duration-200" placeholder="••••••••">
              </div>
              <p *ngIf="password && confirmPassword && password !== confirmPassword" class="mt-1 text-xs text-red-500">Şifreler eşleşmiyor.</p>
            </div>

          <!-- Package Selection -->


            <div class="flex items-center">
                <input id="terms" name="terms" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-800 dark:border-gray-600">
                <label for="terms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Kullanım Koşullarını</a> kabul ediyorum.
                </label>
            </div>

            <div>
              <button type="submit" 
               [disabled]="!fullName || !email || !password || !confirmPassword || password !== confirmPassword"
               [ngClass]="{'opacity-50 cursor-not-allowed': !fullName || !email || !password || !confirmPassword || password !== confirmPassword, 'hover:bg-indigo-500 hover:scale-[1.02]': fullName && email && password && confirmPassword && password === confirmPassword}"
               class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 transform">
                Kayıt Ol
              </button>
            </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Zaten üye misiniz?
          <a href="/login" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Giriş Yap</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  selectedPackageId = '';
  packages: any[] = [];
  showPassword = false;
  appName = AppConstants.appName;

  constructor(
    private authService: AuthService,
    private packageService: PackageService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.toastr.error('Şifreler eşleşmiyor!', 'Hata');
      return;
    }

    const userData = {
      fullName: this.fullName,
      email: this.email,
      password: this.password
    };

    this.authService.register(userData).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.success('Kayıt başarılı! Lütfen e-postanızı doğrulayın.', 'Başarılı');
          this.router.navigate(['/verify-email'], { queryParams: { email: this.email } });
        } else {
          this.toastr.error(res.message || 'Kayıt başarısız', 'Hata');
        }
      },
      error: (err) => {
        // Handled by interceptor
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
