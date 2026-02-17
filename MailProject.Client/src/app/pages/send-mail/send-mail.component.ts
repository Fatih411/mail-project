import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MailService, SendMailRequest } from '../../services/mail.service';
import { SmtpAccountService, SmtpAccount } from '../../services/smtp-account.service';
import { MailTemplateService, MailTemplate } from '../../services/mail-template.service';
import { ContactService, ContactList } from '../../services/contact.service';

@Component({
  selector: 'app-send-mail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tighter">Mail Gönder</h1>
        <p class="text-gray-500 dark:text-gray-400">Hedef kitleyi seçin ve gönderimi başlatın.</p>

        <form [formGroup]="sendForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Left Column: Inputs -->
            <div class="space-y-6">
                 <!-- SMTP & Template -->
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <label for="smtpAccountId" class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-widest">SMTP Hesabı</label>
                        <select id="smtpAccountId" formControlName="smtpAccountId" class="bg-gray-50 dark:bg-gray-700 border-none rounded-2xl p-3 w-full font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 dark:text-white">
                            <option value="">Seçiniz...</option>
                            <option *ngFor="let account of smtpAccounts" [value]="account.id">{{ account.accountName }}</option>
                        </select>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <label for="mailTemplateId" class="block mb-2 text-xs font-black text-gray-400 uppercase tracking-widest">Mail Şablonu</label>
                        <select id="mailTemplateId" formControlName="mailTemplateId" class="bg-gray-50 dark:bg-gray-700 border-none rounded-2xl p-3 w-full font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 dark:text-white">
                            <option value="">Seçiniz...</option>
                            <option *ngFor="let template of mailTemplates" [value]="template.id">{{ template.title }}</option>
                        </select>
                    </div>
                 </div>

                 <!-- Target Selection -->
                 <div class="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
                    <label class="block mb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Hedef Kitle</label>
                    <div class="grid grid-cols-3 gap-3 mb-6">
                        <button type="button" (click)="targetType = 'manual'" [class.bg-indigo-600]="targetType === 'manual'" [class.text-white]="targetType === 'manual'" class="py-3 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Manuel Liste</button>
                        <button type="button" (click)="targetType = 'list'" [class.bg-indigo-600]="targetType === 'list'" [class.text-white]="targetType === 'list'" class="py-3 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Rehberden Seç</button>
                        <button type="button" (click)="targetType = 'all'" [class.bg-indigo-600]="targetType === 'all'" [class.text-white]="targetType === 'all'" class="py-3 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Tüm Rehber</button>
                    </div>

                    <!-- Manual Input -->
                    <div *ngIf="targetType === 'manual'" class="animate-fade-in">
                        <textarea id="recipients" formControlName="recipients" rows="8" class="block p-4 w-full text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-mono" placeholder="ali@test.com&#10;veli@test.com"></textarea>
                        <p class="mt-2 text-[10px] text-gray-400 font-bold uppercase">Her satıra bir mail adresi giriniz.</p>
                    </div>

                    <!-- List Selection -->
                    <div *ngIf="targetType === 'list'" class="animate-fade-in">
                        <select formControlName="contactListId" class="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-2xl p-4 font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10">
                            <option value="">Liste Seçiniz...</option>
                            <option *ngFor="let list of contactLists" [value]="list.id">{{ list.name }} ({{ list.contacts.length }} Kişi)</option>
                        </select>
                    </div>

                    <!-- All Contacts Info -->
                    <div *ngIf="targetType === 'all'" class="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 animate-fade-in flex items-center gap-4">
                        <div class="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div>
                            <h4 class="font-black text-indigo-900 dark:text-indigo-100 uppercase text-sm tracking-tighter">Tüm Rehber Hedeflendi</h4>
                            <p class="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Abonelikten ayrılmayan tüm kayıtlı kişilere gönderim yapılacaktır.</p>
                        </div>
                    </div>
                 </div>

                 <!-- Scheduling & Submit -->
                 <div class="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-6">
                    <div class="flex-1 w-full">
                        <label for="scheduledTime" class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Zamanlı Gönderim (Opsiyonel)</label>
                        <input type="datetime-local" id="scheduledTime" formControlName="scheduledTime" class="bg-gray-50 dark:bg-gray-700 border-none rounded-2xl p-3 w-full font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900 dark:text-white">
                    </div>
                    <button type="submit" [disabled]="sendForm.invalid || isLoading" class="w-full md:w-auto px-8 py-4 text-white bg-indigo-600 hover:bg-indigo-700 font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest text-sm flex items-center justify-center min-w-[200px]">
                        <span *ngIf="isLoading" class="animate-spin mr-3 h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                        {{ isLoading ? 'GÖNDERİLİYOR' : 'BAŞLAT' }}
                    </button>
                 </div>
            </div>

            <!-- Right Column: Preview -->
            <div class="lg:h-full">
                <div class="sticky top-24">
                   <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Önizleme Alani</h3>
                   <div class="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden min-h-[650px] relative">
                      <!-- Browser Frame Mockup -->
                      <div class="w-full h-10 bg-gray-100 border-b border-gray-200 flex items-center px-6 space-x-2">
                         <div class="w-3 h-3 rounded-full bg-red-400"></div>
                         <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                         <div class="w-3 h-3 rounded-full bg-green-400"></div>
                         <div class="ml-4 flex-1 bg-white h-6 rounded-md border border-gray-200 text-[10px] flex items-center px-3 text-gray-400 font-mono overflow-hidden">{{ previewSubject || 'Konu Seçilmedi...' }}</div>
                      </div>
                      
                      <!-- Content -->
                      <div class="p-8 h-full overflow-auto max-h-[calc(100vh-200px)]">
                           <div *ngIf="previewContent" [innerHTML]="previewContent" class="prose max-w-none dark:prose-invert"></div>
                           <div *ngIf="!previewContent" class="flex flex-col items-center justify-center h-[500px] text-gray-300">
                               <div class="w-24 h-24 mb-6 opacity-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                               </div>
                               <p class="font-black uppercase tracking-widest text-xs">Şablon Seçiniz</p>
                           </div>
                      </div>
                   </div>
                </div>
            </div>

        </form>
    </div>
  `
})
export class SendMailComponent implements OnInit {
  sendForm: FormGroup;
  smtpAccounts: SmtpAccount[] = [];
  mailTemplates: MailTemplate[] = [];
  contactLists: any[] = [];
  previewContent: SafeHtml | null = null;
  previewSubject: string = '';
  isLoading = false;
  targetType: 'manual' | 'list' | 'all' = 'manual';

  constructor(
    private fb: FormBuilder,
    private mailService: MailService,
    private smtpService: SmtpAccountService,
    private templateService: MailTemplateService,
    private contactService: ContactService, // Will fix type after import
    private toastr: ToastrService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.sendForm = this.fb.group({
      smtpAccountId: ['', Validators.required],
      mailTemplateId: ['', Validators.required],
      recipients: [''],
      contactListId: [''],
      scheduledTime: [null]
    });
  }

  ngOnInit(): void {
    this.loadSmtpAccounts();
    this.loadMailTemplates();
    this.loadContactLists();

    this.sendForm.get('mailTemplateId')?.valueChanges.subscribe(id => {
      this.updatePreview(id);
    });
  }

  loadContactLists() {
    this.contactService.getContactLists().subscribe({
      next: (res: any) => {
        if (res.isSuccess) this.contactLists = res.data;
      }
    });
  }

  loadSmtpAccounts() {
    this.smtpService.getAll().subscribe({
      next: (res: any) => {
        if (res.isSuccess) this.smtpAccounts = res.data;
      }
    });
  }

  loadMailTemplates() {
    this.templateService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) this.mailTemplates = res.data;
      }
    });
  }

  updatePreview(templateId: string) {
    const template = this.mailTemplates.find(t => t.id === templateId);
    if (template) {
      this.previewContent = this.sanitizer.bypassSecurityTrustHtml(template.htmlContent);
      this.previewSubject = template.subject;
    } else {
      this.previewContent = null;
      this.previewSubject = '';
    }
  }

  onSubmit() {
    if (this.sendForm.invalid) return;

    // Custom Validation based on targetType
    const formVal = this.sendForm.value;
    if (this.targetType === 'manual' && !formVal.recipients?.trim()) {
      this.toastr.warning('Lütfen alıcı listesini giriniz.');
      return;
    }
    if (this.targetType === 'list' && !formVal.contactListId) {
      this.toastr.warning('Lütfen bir liste seçiniz.');
      return;
    }

    this.isLoading = true;
    const recipients = this.targetType === 'manual'
      ? formVal.recipients.split('\n').filter((r: string) => r.trim() !== '')
      : [];

    let scheduledTime: string | undefined;
    if (formVal.scheduledTime) {
      const localDate = new Date(formVal.scheduledTime);
      scheduledTime = localDate.toISOString();
    }

    const request: SendMailRequest = {
      smtpAccountId: formVal.smtpAccountId,
      mailTemplateId: formVal.mailTemplateId,
      recipients: recipients,
      contactListId: this.targetType === 'list' ? formVal.contactListId : undefined,
      sendToAll: this.targetType === 'all',
      scheduledTime: scheduledTime
    };

    this.mailService.sendMailBatch(request).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess) {
          if (request.scheduledTime) {
            this.toastr.info('Gönderim planlandı. Belirttiğiniz tarihte gönderilecek.', 'Planlandı');
          } else {
            this.toastr.success('Gönderim başarıyla kuyruğa eklendi.', 'Başarılı');
          }
          this.router.navigate(['/admin/dashboard']); // Navigate to home
        } else {
          this.toastr.error(res.message, 'Hata');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Bir hata oluştu.', 'Hata');
      }
    });
  }
}
