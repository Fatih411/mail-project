import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MailTemplateService } from '../../services/mail-template.service';
import { ToastrService } from 'ngx-toastr';
import { MailTemplateWizardComponent } from './mail-template-wizard/mail-template-wizard.component';
import { MailBuilderComponent } from './mail-builder/mail-builder.component';

@Component({
  selector: 'app-mail-template-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MailTemplateWizardComponent, MailBuilderComponent],
  template: `
    <div class="space-y-6">
          
          <!-- Header -->
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
             <div class="flex items-center">
                <a routerLink="/admin/mail-templates" class="mr-4 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                   <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                   </svg>
                </a>
                <div>
                   <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tighter">{{ isEditMode ? 'Şablonu Düzenle' : 'Yeni Şablon' }}</h1>
                   <div class="flex items-center gap-2 mt-1">
                      <span [class.bg-emerald-500]="isAdvancedMode" [class.bg-gray-400]="!isAdvancedMode" class="w-2 h-2 rounded-full"></span>
                      <p class="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">{{ isAdvancedMode ? 'Gelişmiş Tasarım Modu' : 'Klasik Kod Modu' }}</p>
                   </div>
                </div>
             </div>
             <div class="flex items-center gap-3 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <button (click)="isAdvancedMode = false" [class.bg-white]="!isAdvancedMode" [class.dark:bg-gray-700]="!isAdvancedMode" [class.shadow-xl]="!isAdvancedMode" class="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all">KLASİK</button>
                <button (click)="isAdvancedMode = true" [class.bg-white]="isAdvancedMode" [class.dark:bg-gray-700]="isAdvancedMode" [class.shadow-xl]="isAdvancedMode" class="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2">
                    GELİŞMİŞ
                    <span class="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] rounded-sm animate-pulse">BETA</span>
                </button>
             </div>

             <div class="flex space-x-3 mt-4 sm:mt-0">
                 <button (click)="showWizard = true" class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-all duration-200">
                    <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Sihirbazı Kullan
                 </button>
                 <button (click)="saveTemplate()" [disabled]="form.invalid || loading" class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg *ngIf="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ loading ? 'Kaydediliyor...' : 'Kaydet' }}
                 </button>
             </div>
          </div>

          <app-mail-template-wizard *ngIf="showWizard" (onGenerate)="onWizardGenerate($event)" (onClose)="showWizard = false"></app-mail-template-wizard>

          <!-- Metadata Section -->
          <div class="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 mb-6" [formGroup]="form">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Şablon İsmi (İç kullanım)</label>
                   <input type="text" formControlName="title" class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Örn: Yeni Kayıt Selamlama">
                </div>
                <div>
                   <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">E-Posta Konu Başlığı</label>
                   <input type="text" formControlName="subject" class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl p-4 font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Mail alıcısının göreceği başlık">
                </div>
             </div>
          </div>

          <!-- Advanced Builder -->
          <div *ngIf="isAdvancedMode" class="h-[750px] animate-scale-in">
             <app-mail-builder (htmlGenerated)="onBuilderGenerate($event)"></app-mail-builder>
          </div>

          <!-- Editor Grid -->
          <div *ngIf="!isAdvancedMode" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" [formGroup]="form">
             
             <!-- Left: Code Editor -->
             <div class="flex flex-col h-[700px] p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                 <div class="flex items-center justify-between mb-4">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">HTML KAYNAK KODU</label>
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Manuel Düzenleme</span>
                    </div>
                 </div>
                 <textarea formControlName="htmlContent" class="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white rounded-2xl p-6 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner" placeholder="<html>...</html>"></textarea>
             </div>

             <!-- Right: Preview -->
             <div class="lg:h-full">
                <div class="sticky top-24 h-[calc(100vh-8rem)]">
                   <div class="flex items-center justify-between mb-4">
                       <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Canli Önizleme</h3>
                       <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Senkronize</span>
                       </div>
                   </div>
                   <div class="w-full h-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative font-sans">
                      <!-- Browser Header Mockup -->
                      <div class="w-full h-10 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 space-x-2">
                         <div class="w-3 h-3 rounded-full bg-red-400/80"></div>
                         <div class="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                         <div class="w-3 h-3 rounded-full bg-green-400/80"></div>
                         <div class="ml-4 flex-1 bg-white dark:bg-gray-700 h-6 rounded-lg text-[10px] flex items-center px-4 text-gray-400 font-mono overflow-hidden">
                            {{ form.get('subject')?.value || 'Konu Başlığı...' }}
                         </div>
                      </div>
                      
                      <!-- Preview Content Area -->
                      <div class="w-full h-[calc(100%-2.5rem)] overflow-auto bg-gray-50/30 dark:bg-transparent custom-scrollbar">
                         <div [innerHTML]="sanitizedContent" class="p-0 prose max-w-none"></div>
                         
                         <!-- Empty State Overlay -->
                         <div *ngIf="!form.get('htmlContent')?.value" class="absolute inset-0 pt-10 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
                            <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <svg class="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            </div>
                            <p class="text-gray-400 text-xs font-black uppercase tracking-widest">İçerik bekleniyor...</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

          </div>
     </div>
  `
})
export class MailTemplateEditorComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEditMode = false;
  templateId: string | null = null;
  showWizard = false;
  isAdvancedMode = true;

  constructor(
    private fb: FormBuilder,
    private templateService: MailTemplateService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      htmlContent: ['', Validators.required],
      ccList: [''],
      bccList: ['']
    });
  }

  ngOnInit() {
    this.templateId = this.route.snapshot.paramMap.get('id');
    if (this.templateId) {
      this.isEditMode = true;
      this.loadTemplate(this.templateId);
    }
  }

  loadTemplate(id: string) {
    this.loading = true;
    this.templateService.getById(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.form.patchValue(res.data);
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Şablon yüklenemedi.', 'Hata');
        this.loading = false;
      }
    });
  }

  onWizardGenerate(html: string) {
    this.form.patchValue({ htmlContent: html });
    this.showWizard = false;
    this.toastr.success('Şablon içeriği oluşturuldu.');
  }

  onBuilderGenerate(html: string) {
    this.form.patchValue({ htmlContent: html });
  }

  get sanitizedContent(): SafeHtml {
    const content = this.form.get('htmlContent')?.value || '';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  saveTemplate() {
    if (this.form.invalid) return;

    this.loading = true;
    const templateData = this.form.value;

    if (this.isEditMode && this.templateId) {
      this.templateService.update({ id: this.templateId, ...templateData }).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success('Şablon güncellendi.', 'Başarılı');
            this.router.navigate(['/admin/mail-templates']);
          } else {
            this.toastr.error(res.message, 'Hata');
          }
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Güncelleme sırasında hata oluştu.', 'Hata');
          this.loading = false;
        }
      });
    } else {
      this.templateService.create(templateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success('Şablon oluşturuldu.', 'Başarılı');
            this.router.navigate(['/admin/mail-templates']);
          } else {
            this.toastr.error(res.message, 'Hata');
          }
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Oluşturma sırasında hata oluştu.', 'Hata');
          this.loading = false;
        }
      });
    }
  }
}
