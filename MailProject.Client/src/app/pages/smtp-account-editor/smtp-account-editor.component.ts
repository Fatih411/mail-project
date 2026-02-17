import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SmtpAccountService } from '../../services/smtp-account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-smtp-account-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="space-y-6">
           <div class="max-w-2xl mx-auto">
              
              <!-- Header -->
              <div class="flex items-center justify-between mb-8">
                 <div class="flex items-center">
                    <a routerLink="/admin/smtp-accounts" class="mr-4 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                       <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                       </svg>
                    </a>
                    <div>
                       <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white">{{ isEditMode ? 'Hesabı Düzenle' : 'Yeni SMTP Hesabı' }}</h1>
                       <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">SMTP sunucu bilgilerinizi giriniz.</p>
                    </div>
                 </div>
              </div>

              <!-- Form Card -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                 
                 <div class="p-8">
                    <form [formGroup]="form" (ngSubmit)="saveAccount()" class="space-y-6">
                       
                       <div>
                          <label for="accountName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Hesap Adı</label>
                          <input type="text" id="accountName" formControlName="accountName" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Örn: İş Maili">
                          <div *ngIf="form.get('accountName')?.touched && form.get('accountName')?.invalid" class="mt-1 text-sm text-red-600 dark:text-red-500">Hesap adı gereklidir.</div>
                       </div>

                       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <label for="host" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sunucu (Host)</label>
                             <input type="text" id="host" formControlName="host" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="smtp.example.com">
                             <div *ngIf="form.get('host')?.touched && form.get('host')?.invalid" class="mt-1 text-sm text-red-600 dark:text-red-500">Host gereklidir.</div>
                          </div>
                          <div>
                             <label for="port" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Port</label>
                             <input type="number" id="port" formControlName="port" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="587">
                             <div *ngIf="form.get('port')?.touched && form.get('port')?.invalid" class="mt-1 text-sm text-red-600 dark:text-red-500">Port gereklidir.</div>
                          </div>
                       </div>

                       <div>
                          <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Kullanıcı Adı</label>
                          <input type="text" id="username" formControlName="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="user@example.com">
                          <div *ngIf="form.get('username')?.touched && form.get('username')?.invalid" class="mt-1 text-sm text-red-600 dark:text-red-500">Kullanıcı adı gereklidir.</div>
                       </div>

                       <div>
                          <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Şifre</label>
                          <input type="password" id="password" formControlName="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="••••••••">
                          <p *ngIf="isEditMode" class="mt-1 text-xs text-gray-500 dark:text-gray-400">Değiştirmek istemiyorsanız boş bırakın.</p>
                          <div *ngIf="form.get('password')?.touched && form.get('password')?.invalid && !isEditMode" class="mt-1 text-sm text-red-600 dark:text-red-500">Şifre gereklidir.</div>
                       </div>

                       <div class="flex items-center space-x-4">
                          <div class="flex items-center">
                             <input id="enableSsl" type="checkbox" formControlName="enableSsl" class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                             <label for="enableSsl" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">SSL Kullan (Güvenli Bağlantı)</label>
                          </div>
                          <div class="flex items-center">
                             <input id="isDefault" type="checkbox" formControlName="isDefault" class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                             <label for="isDefault" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Varsayılan Yap</label>
                          </div>
                       </div>

                       <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
                          <button type="submit" [disabled]="form.invalid || loading" class="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                             {{ loading ? 'Kaydediliyor...' : 'Kaydet' }}
                          </button>
                       </div>
                    </form>
                 </div>
              </div>

           </div>
    </div>
  `
})
export class SmtpAccountEditorComponent implements OnInit {
  form: FormGroup;
  loading = false;
  isEditMode = false;
  accountId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private accountService: SmtpAccountService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      accountName: ['', Validators.required],
      host: ['', Validators.required],
      port: [587, Validators.required],
      username: ['', Validators.required],
      password: [''], // Required only for create, validation handled below
      enableSsl: [true],
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.accountId = this.route.snapshot.paramMap.get('id');
    if (this.accountId) {
      this.isEditMode = true;
      this.loadAccount(this.accountId);
      this.form.get('password')?.clearValidators(); // Password optional on edit
    } else {
      this.form.get('password')?.setValidators(Validators.required); // Password required on create
    }
    this.form.get('password')?.updateValueAndValidity();
  }

  loadAccount(id: string) {
    this.loading = true;
    this.accountService.getById(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.form.patchValue(res.data);
          this.form.get('password')?.setValue(''); // Don't show password
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Hesap yüklenemedi.', 'Hata');
        this.loading = false;
      }
    });
  }

  saveAccount() {
    if (this.form.invalid) return;

    this.loading = true;
    const accountData = this.form.value;

    if (this.isEditMode && this.accountId) {
      this.accountService.update({ id: this.accountId, ...accountData }).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success('Hesap güncellendi.', 'Başarılı');
            this.router.navigate(['/admin/smtp-accounts']);
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
      this.accountService.create(accountData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success('Hesap oluşturuldu.', 'Başarılı');
            this.router.navigate(['/admin/smtp-accounts']);
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
