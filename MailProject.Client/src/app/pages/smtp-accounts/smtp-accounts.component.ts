import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SmtpAccountService, SmtpAccount } from '../../services/smtp-account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-smtp-accounts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-4 mt-14">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
             <div>
                <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">SMTP Hesapları</h1>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Mail gönderimi yapacağınız SMTP sunucularını buradan yönetebilirsiniz.</p>
             </div>
             <a routerLink="/admin/smtp-accounts/new" class="mt-4 sm:mt-0 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all duration-200 shadow-lg hover:shadow-indigo-500/30">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Yeni Hesap Ekle
             </a>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && accounts.length === 0" class="flex flex-col items-center justify-center p-10 bg-white border border-dashed border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-700">
             <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">
                <svg class="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
             </div>
             <h3 class="text-lg font-medium text-gray-900 dark:text-white">Henüz SMTP hesabı eklemediniz</h3>
             <p class="mt-1 text-gray-500 dark:text-gray-400 text-center max-w-sm">Mail gönderebilmek için en az bir SMTP hesabı eklemelisiniz.</p>
          </div>

          <!-- Account List -->
          <div *ngIf="accounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div *ngFor="let account of accounts" class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300">
                <div class="absolute top-4 right-4" *ngIf="account.isDefault">
                    <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Varsayılan</span>
                </div>
                <div class="p-6">
                   <div class="flex items-start mb-4">
                      <div class="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg mr-4">
                         <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                         </svg>
                      </div>
                      <div>
                          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ account.accountName }}</h3>
                          <p class="text-sm text-gray-500 dark:text-gray-400">{{ account.host }}:{{ account.port }}</p>
                      </div>
                   </div>
                   
                   <div class="mb-4">
                        <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {{ account.username }}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            SSL: {{ account.enableSsl ? 'Aktif' : 'Pasif' }}
                        </p>
                   </div>

                   <div class="flex justify-end space-x-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                      <a [routerLink]="['/admin/smtp-accounts/edit', account.id]" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">Düzenle</a>
                      <button (click)="deleteAccount(account.id)" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Sil</button>
                   </div>
                </div>
             </div>
          </div>
    </div>
  `
})
export class SmtpAccountsComponent implements OnInit {
  accounts: SmtpAccount[] = [];
  loading = true;

  constructor(
    private accountService: SmtpAccountService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.accountService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.accounts = res.data;
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Hesaplar yüklenirken bir hata oluştu.', 'Hata');
        this.loading = false;
      }
    });
  }

  deleteAccount(id: string) {
    if (confirm('Bu hesabı silmek istediğinize emin misiniz?')) {
      this.accountService.delete(id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success('Hesap başarıyla silindi.', 'Başarılı');
            this.loadAccounts();
          } else {
            this.toastr.error(res.message || 'Silme işlemi başarısız.', 'Hata');
          }
        },
        error: () => {
          this.toastr.error('Silme işlemi sırasında bir hata oluştu.', 'Hata');
        }
      });
    }
  }
}
