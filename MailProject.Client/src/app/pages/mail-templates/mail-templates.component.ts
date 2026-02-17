import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MailTemplateService, MailTemplate } from '../../services/mail-template.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
   selector: 'app-mail-templates',
   standalone: true,
   imports: [CommonModule, RouterModule],
   template: `
    <div class="p-4 mt-14">
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
             <div>
                <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Şablonlarım</h1>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Oluşturduğunuz mail şablonlarını buradan yönetebilirsiniz.</p>
             </div>
             <a routerLink="/admin/mail-templates/new" class="mt-4 sm:mt-0 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all duration-200 shadow-lg hover:shadow-indigo-500/30">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Yeni Şablon
             </a>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && templates.length === 0" class="flex flex-col items-center justify-center p-10 bg-white border border-dashed border-gray-300 rounded-xl dark:bg-gray-800 dark:border-gray-700">
             <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">
                <svg class="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
             </div>
             <h3 class="text-lg font-medium text-gray-900 dark:text-white">Henüz şablon eklemediniz</h3>
             <p class="mt-1 text-gray-500 dark:text-gray-400 text-center max-w-sm">Mail gönderimlerinizde kullanmak üzere HTML şablonları oluşturun.</p>
          </div>

          <!-- Template List -->
          <div *ngIf="templates.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div *ngFor="let template of templates" class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300">
                <div class="p-6">
                   <div class="flex justify-between items-start mb-4">
                      <div class="p-2 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                         <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                      </div>
                      <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <a [routerLink]="['/admin/mail-templates/edit', template.id]" class="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 01-2 2v11a2 2 0 012 2h11a2 2 0 012-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                         </a>
                         <button (click)="deleteTemplate(template.id)" class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                         </button>
                      </div>
                   </div>
                   <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1" title="{{ template.title }}">{{ template.title }}</h3>
                   <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{{ template.subject }}</p>
                   <div class="flex items-center text-xs text-gray-400 dark:text-gray-500">
                      <span>HTML Format</span>
                   </div>
                </div>
             </div>
          </div>
    </div>
  `
})
export class MailTemplatesComponent implements OnInit {
   templates: MailTemplate[] = [];
   loading = true;

   constructor(
      private templateService: MailTemplateService,
      private toastr: ToastrService,
      private confirmService: ConfirmDialogService
   ) { }

   ngOnInit() {
      this.loadTemplates();
   }

   loadTemplates() {
      this.loading = true;
      this.templateService.getAll().subscribe({
         next: (res) => {
            if (res.isSuccess) {
               this.templates = res.data;
            }
            this.loading = false;
         },
         error: () => {
            this.toastr.error('Şablonlar yüklenirken bir hata oluştu.', 'Hata');
            this.loading = false;
         }
      });
   }

   async deleteTemplate(id: string) {
      const confirmed = await this.confirmService.confirm({
         title: 'Şablonu Sil',
         message: 'Bu şablonu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
         confirmText: 'Sil',
         cancelText: 'Vazgeç',
         type: 'danger'
      });

      if (confirmed) {
         this.templateService.delete(id).subscribe({
            next: (res) => {
               if (res.isSuccess) {
                  this.toastr.success('Şablon başarıyla silindi.', 'Başarılı');
                  this.loadTemplates();
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
