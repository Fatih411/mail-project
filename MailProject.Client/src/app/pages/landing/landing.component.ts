import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageService } from '../../services/package.service';
import { PackageCardComponent } from '../../components/package-card/package-card.component';
import { AppConstants } from '../../core/constants/app.constants';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, PackageCardComponent],
  template: `
    <div class="bg-white dark:bg-gray-800 transition-colors duration-300">
      <!-- Hero Section -->
      <div class="relative isolate px-6 pt-14 lg:px-8 overflow-hidden">
        <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
        </div>

        <div class="mx-auto max-w-2xl py-16 sm:py-24 lg:py-36 flex flex-col items-center">
            
          <!-- Mail Animation Container -->
          <div class="mb-8 relative w-40 h-40 animate-float" style="animation: float 3s ease-in-out infinite;">
             <!-- Simple CSS/SVG Envelope -->
             <svg class="w-full h-full text-indigo-600 dark:text-indigo-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
             </svg>
             <!-- Decoration elements -->
             <div class="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
             <div class="absolute top-1/2 -left-4 w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>

          <style>
             @keyframes float {
                 0% { transform: translateY(0px); }
                 50% { transform: translateY(-20px); }
                 100% { transform: translateY(0px); }
             }
          </style>

          <div class="text-center">
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                {{ appName }}
            </h1>
            <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Kampanyalarınızı yönetin, başarınızı takip edin ve güçlü e-posta pazarlama platformumuzla işinizi büyütün.
            </p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
              <a href="/register" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-transform hover:scale-105">Hemen Başlayın</a>
              <a href="#pricing" class="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:underline">Paketleri İncele <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      </div>

      <!-- Packages Section -->
      <div id="pricing" class="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl sm:text-center">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Fiyatlandırma Paketleri</h2>
            <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">İşletmenizin ihtiyaçlarına en uygun paketi seçin.</p>
          </div>
          <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none justify-center">
             <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full">
                <!-- Package Cards Loop -->
                <app-package-card *ngFor="let pkg of packages" [package]="pkg" class="transform transition hover:-translate-y-2"></app-package-card>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent {
  packages: any[] = []; // In real app, fetch from service
  appName = AppConstants.appName;

  constructor(private packageService: PackageService) {
    this.loadPackages();
  }

  loadPackages() {
    this.packageService.getPackages().subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.packages = res.data;
        }
      },
      error: (err) => console.error('Failed to load packages', err)
    });
  }
}
