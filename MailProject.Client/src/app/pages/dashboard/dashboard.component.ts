import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { ToastrService } from 'ngx-toastr';

@Component({
   selector: 'app-dashboard',
   standalone: true,
   imports: [CommonModule],
   template: `
    <div>
       <div class="p-4 mt-14">
          
          <!-- Header Section -->
          <div class="mb-8">
             <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Genel Bakış</h1>
             <p class="text-gray-600 dark:text-gray-400">Kampanyalarınızı ve gönderim istatistiklerinizi buradan takip edebilirsiniz.</p>
          </div>

          <!-- Admin Stats Grid -->
          <div *ngIf="stats?.totalUsers" class="mb-8">
             <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Sistem Geneli (Admin)</h2>
             <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <!-- Total Users -->
                 <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div class="flex justify-between items-center">
                       <div>
                          <p class="text-blue-100 text-sm font-medium mb-1">Toplam Kullanıcı</p>
                          <h3 class="text-3xl font-bold">{{ stats?.totalUsers }}</h3>
                       </div>
                       <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                       </div>
                    </div>
                 </div>

                 <!-- System Total Mails -->
                 <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div class="flex justify-between items-center">
                       <div>
                          <p class="text-indigo-100 text-sm font-medium mb-1">Sistem Geneli Gönderim</p>
                          <h3 class="text-3xl font-bold">{{ stats?.systemTotalEmails }}</h3>
                       </div>
                       <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                       </div>
                    </div>
                 </div>

                 <!-- System Failed Mails -->
                 <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div class="flex justify-between items-center">
                       <div>
                          <p class="text-red-100 text-sm font-medium mb-1">Sistem Geneli Hata</p>
                          <h3 class="text-3xl font-bold">{{ stats?.systemTotalFailed }}</h3>
                       </div>
                       <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                       </div>
                    </div>
                 </div>
             </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             
             <!-- Card 1: Kalan Kredi -->
             <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:transform hover:scale-105 transition-all duration-300">
                <div class="flex justify-between items-start">
                   <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Kalan Günlük Kredi</p>
                      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats?.remainingDailyLimit || 0 }} <span class="text-xs text-gray-400 font-normal">/ {{ stats?.totalDailyLimit || 0 }}</span></h3>
                   </div>
                   <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                      <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                </div>
                <div class="mt-4">
                   <div class="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                      <div class="bg-indigo-600 h-1.5 rounded-full" [style.width.%]="getUsagePercentage()"></div>
                   </div>
                </div>
             </div>

             <!-- Card 2: Başarılı Gönderim -->
             <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-emerald-500 hover:transform hover:scale-105 transition-all duration-300">
                <div class="flex justify-between items-start">
                   <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Başarılı Gönderim</p>
                      <h3 class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ stats?.successfulEmails || 0 }}</h3>
                   </div>
                   <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                      <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                </div>
                <p class="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium">Toplam gönderim içerisindeki oran</p>
             </div>

             <!-- Card 3: Hatalı Gönderim -->
             <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:transform hover:scale-105 transition-all duration-300">
                <div class="flex justify-between items-start">
                   <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Hatalı Gönderim</p>
                      <h3 class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats?.failedEmails || 0 }}</h3>
                   </div>
                   <div class="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                      <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                </div>
                 <p class="mt-4 text-xs text-gray-500 dark:text-gray-400 font-medium">Lütfen logları kontrol ediniz.</p>
             </div>

             <!-- Card 4: Paket Bilgisi -->
             <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:transform hover:scale-105 transition-all duration-300">
                <div class="flex justify-between items-start">
                   <div>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mevcut Paket</p>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate">{{ stats?.packageName || 'Standart' }}</h3>
                   </div>
                   <div class="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                   </div>
                </div>
                <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">Bitiş: <span class="font-medium text-gray-700 dark:text-gray-200">{{ stats?.packageEndDate | date:'dd.MM.yyyy' }}</span></p>
             </div>

          </div>
          
          <!-- Recent Activity Table -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
             <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">Son Aktiviteler</h3>
             </div>
             <div class="overflow-x-auto">
                <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                   <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                         <th scope="col" class="px-6 py-3">Alıcı</th>
                         <th scope="col" class="px-6 py-3">Konu</th>
                         <th scope="col" class="px-6 py-3">Durum</th>
                         <th scope="col" class="px-6 py-3">Tarih</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr *ngFor="let log of stats?.recentActivity" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                         <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ log.recipientEmail }}</td>
                         <td class="px-6 py-4">{{ log.subject || '-' }}</td>
                         <td class="px-6 py-4">
                            <span [ngClass]="{
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': log.status === 'Success',
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': log.status === 'Pending',
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': log.status === 'Failed' || log.status === 'Fail'
                            }" class="px-2 py-1 rounded-full text-xs font-semibold">
                                {{ log.status === 'Success' ? 'Başarılı' : (log.status === 'Pending' ? 'Sırada' : 'Hatalı') }}
                            </span>
                         </td>
                         <td class="px-6 py-4">{{ log.sentAt | date:'dd.MM.yyyy HH:mm' }}</td>
                      </tr>
                      <tr *ngIf="!stats?.recentActivity?.length" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                         <td colspan="4" class="px-6 py-4 text-center text-gray-500">Henüz bir aktivite yok.</td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
   stats: DashboardStats | null = null;
   loading = true;

   constructor(
      private dashboardService: DashboardService,
      private toastr: ToastrService
   ) { }

   ngOnInit() {
      this.loadStats();
   }

   loadStats() {
      this.dashboardService.getStats().subscribe({
         next: (res) => {
            if (res.isSuccess) {
               this.stats = res.data;
            } else {
               this.toastr.error('İstatistikler yüklenemedi', 'Hata');
            }
            this.loading = false;
         },
         error: (err) => {
            this.loading = false;
            // console.error(err);
         }
      });
   }

   getUsagePercentage(): number {
      if (!this.stats || this.stats.totalDailyLimit === 0) return 0;
      const sent = this.stats.totalDailyLimit - this.stats.remainingDailyLimit;
      return (sent / this.stats.totalDailyLimit) * 100;
   }
}
