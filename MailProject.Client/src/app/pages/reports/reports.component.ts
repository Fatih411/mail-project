import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, ReportFilter, ReportItem, ReportResult } from '../../services/report.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 mt-14">
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Detaylı Raporlar</h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Mail gönderim geçmişinizi ve kuyruk durumunu detaylı inceleyin.</p>
        </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Search -->
                <div>
                    <label for="search" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Arama</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input type="text" id="search" [(ngModel)]="filter.searchTerm" (keyup.enter)="loadReports()" class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Alıcı maili veya konu...">
                    </div>
                </div>

                <!-- Status -->
                <div>
                    <label for="status" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Durum</label>
                    <select id="status" [(ngModel)]="filter.status" (change)="loadReports()" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="">Tümü</option>
                        <option value="Success">Başarılı</option>
                        <option value="Fail">Hatalı</option>
                        <option value="Pending">Sırada (Bekliyor)</option>
                    </select>
                </div>

                <!-- Date Range (Start) -->
                <div>
                    <label for="startDate" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Başlangıç Tarihi</label>
                    <input type="date" id="startDate" [(ngModel)]="filter.startDate" (change)="loadReports()" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                </div>

                 <!-- Date Range (End) -->
                 <div>
                    <label for="endDate" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bitiş Tarihi</label>
                    <input type="date" id="endDate" [(ngModel)]="filter.endDate" (change)="loadReports()" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                </div>
            </div>
             <div class="mt-4 flex justify-end">
                <button (click)="loadReports()" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Filtrele</button>
            </div>
        </div>

        <!-- Table -->
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">Sıra No</th>
                        <th scope="col" class="px-6 py-3">Tarih</th>
                        <th scope="col" class="px-6 py-3">Alıcı</th>
                        <th scope="col" class="px-6 py-3">Konu</th>
                        <th scope="col" class="px-6 py-3">Açılma</th>
                        <th scope="col" class="px-6 py-3">Tıklama</th>
                        <th scope="col" class="px-6 py-3">Durum</th>
                        <th scope="col" class="px-6 py-3">Detay</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let item of result?.items; let i = index" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ item.index }}</td>
                        <td class="px-6 py-4">{{ item.date | date:'dd.MM.yyyy HH:mm:ss' }}</td>
                        <td class="px-6 py-4">{{ item.recipient }}</td>
                        <td class="px-6 py-4 max-w-xs truncate" title="{{item.subject}}">{{ item.subject }}</td>
                        <td class="px-6 py-4">
                            <span *ngIf="item.openedAt" class="text-green-600 flex items-center gap-1 font-bold" title="{{item.openedAt | date:'dd.MM.yyyy HH:mm'}}">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Açıldı
                            </span>
                            <span *ngIf="!item.openedAt" class="text-gray-300">-</span>
                        </td>
                        <td class="px-6 py-4">
                            <span *ngIf="item.clickedAt" class="text-blue-600 flex items-center gap-1 font-bold" title="{{item.clickedAt | date:'dd.MM.yyyy HH:mm'}}">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
                                Tıklandı
                            </span>
                            <span *ngIf="!item.clickedAt" class="text-gray-300">-</span>
                        </td>
                        <td class="px-6 py-4">
                            <span *ngIf="item.isBounced" class="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-semibold" title="{{item.bounceReason}}">
                                Bounce
                            </span>
                            <span *ngIf="!item.isBounced" [ngClass]="{
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': item.status === 'Success',
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300': item.status === 'Fail',
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300': item.status === 'Pending'
                            }" class="px-2 py-1 rounded-full text-xs font-semibold">
                                {{ item.status === 'Success' ? 'Başarılı' : (item.status === 'Fail' ? 'Hatalı' : 'Sırada') }}
                            </span>
                        </td>
                         <td class="px-6 py-4">
                            <button *ngIf="item.errorMessage" (click)="showError(item.errorMessage)" class="font-medium text-red-600 dark:text-red-500 hover:underline">Hata Gör</button>
                             <span *ngIf="!item.errorMessage">-</span>
                        </td>
                    </tr>
                    <tr *ngIf="!result?.items?.length" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                         <td colspan="6" class="px-6 py-4 text-center">Kayıt bulunamadı.</td>
                    </tr>
                </tbody>
            </table>
            
             <!-- Pagination -->
            <div class="p-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" *ngIf="result && result.totalPages > 1">
                <span class="text-sm text-gray-700 dark:text-gray-400">
                    Toplam <span class="font-semibold text-gray-900 dark:text-white">{{ result.totalCount }}</span> kayıttan <span class="font-semibold text-gray-900 dark:text-white">{{ (result.pageNumber - 1) * result.pageSize + 1 }}</span> - <span class="font-semibold text-gray-900 dark:text-white">{{ Math.min(result.pageNumber * result.pageSize, result.totalCount) }}</span> arası gösteriliyor
                </span>
                <div class="inline-flex mt-2 xs:mt-0">
                    <button (click)="changePage(result.pageNumber - 1)" [disabled]="result.pageNumber === 1" class="flex items-center justify-center px-3 py-2 h-8 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        Önceki
                    </button>
                    <button (click)="changePage(result.pageNumber + 1)" [disabled]="result.pageNumber === result.totalPages" class="flex items-center justify-center px-3 py-2 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                        Sonraki
                    </button>
                </div>
            </div>
        </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  filter: ReportFilter = {
    pageNumber: 1,
    pageSize: 20,
    status: ''
  };
  result: ReportResult | null = null;
  loading = false;
  Math = Math;

  constructor(private reportService: ReportService, private toastr: ToastrService) { }

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.reportService.getReports(this.filter).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.result = res.data;
        } else {
          this.toastr.error('Raporlar yüklenemedi', 'Hata');
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Bir hata oluştu', 'Hata');
        this.loading = false;
      }
    });
  }

  changePage(page: number) {
    if (page < 1 || (this.result && page > this.result.totalPages)) return;
    this.filter.pageNumber = page;
    this.loadReports();
  }

  showError(msg: string) {
    alert(msg); // Simple alert for now, could be a modal
  }
}
