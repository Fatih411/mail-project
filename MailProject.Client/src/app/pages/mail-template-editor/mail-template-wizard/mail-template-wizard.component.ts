import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';


@Component({
  selector: 'app-mail-template-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-hidden">
      <!-- Ana Modal Konteyneri -->
      <div class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-[0_32px_128px_rgba(0,0,0,0.5)] max-w-7xl w-full h-[90vh] flex flex-col transform transition-all scale-in border border-white/40 dark:border-white/10 rounded-[3rem] overflow-hidden">
        
        <!-- Üst Bar -->
        <div class="px-10 py-6 border-b border-gray-100/50 dark:border-gray-800/50 flex items-center justify-between bg-white/40 dark:bg-gray-900/40">
          <div class="flex items-center gap-5">
            <div class="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-2xl shadow-indigo-500/40 group hover:rotate-6 transition-transform">
              <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <div>
              <h3 class="text-2xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">MAIL SİHİRBAZI</h3>
              <div class="flex items-center gap-2">
                 <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                 <p class="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">PRO TASARIM EDİTÖRÜ</p>
              </div>
            </div>
          </div>
          
          <!-- Modern Stepper -->
          <div class="hidden lg:flex items-center gap-4 bg-white/50 dark:bg-black/20 px-8 py-3 rounded-[2rem] border border-white/60 dark:border-white/5 shadow-inner">
            <div class="flex items-center gap-3">
                <span [ngClass]="{'bg-indigo-600 text-white shadow-indigo-500/40': step >= 1, 'bg-gray-100': step < 1}" class="w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black transition-all duration-700 shadow-lg">01</span>
                <span class="text-xs font-black tracking-widest uppercase transition-colors duration-500" [class.text-indigo-600]="step === 1" [class.text-gray-400]="step !== 1">DÜZEN</span>
            </div>
            <div class="w-12 h-1 bg-gray-100 dark:bg-gray-800 rounded-full relative overflow-hidden">
                <div class="absolute inset-0 bg-indigo-600 transition-all duration-1000" [style.transform]="step >= 2 ? 'translateX(0)' : 'translateX(-100%)'"></div>
            </div>
            <div class="flex items-center gap-3">
                <span [ngClass]="{'bg-indigo-600 text-white shadow-indigo-500/40': step >= 2, 'bg-gray-100': step < 2}" class="w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-black transition-all duration-700 shadow-lg">02</span>
                <span class="text-xs font-black tracking-widest uppercase transition-colors duration-500" [class.text-indigo-600]="step === 2" [class.text-gray-400]="step !== 2">TASARIM</span>
            </div>
          </div>

          <button (click)="close()" class="w-12 h-12 flex items-center justify-center bg-white/40 dark:bg-gray-800 rounded-2xl hover:bg-red-500 hover:text-white group transition-all duration-300 shadow-sm border border-white/60 dark:border-white/5 hover:rotate-90">
            <svg class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Ana Gövde -->
        <div class="flex-1 flex overflow-hidden bg-gray-50/20 dark:bg-transparent">
          
          <!-- Sol Panel: Kontroller -->
          <div class="w-[450px] shrink-0 p-8 overflow-y-auto custom-scrollbar border-r border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40">
            
            <!-- Adım 1: Düzen Kataloğu -->
            <div *ngIf="step === 1" class="animate-slide-up space-y-8">
              <div class="mb-4">
                <h4 class="text-2xl font-black text-gray-900 dark:text-white leading-tight">Bir Şablon Seçin</h4>
                <p class="text-sm text-gray-400 mt-2">Tasarıma en uygun temel mizanpajı seçin.</p>
              </div>

              <div class="grid grid-cols-1 gap-6 pb-20">
                <div *ngFor="let layout of layouts" (click)="selectLayout(layout.id)" 
                     class="group relative cursor-pointer bg-white/50 dark:bg-white/5 backdrop-blur-sm p-6 rounded-[2.5rem] border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                     [ngClass]="selectedLayout === layout.id ? 'border-indigo-600 shadow-2xl shadow-indigo-500/20 bg-indigo-50/10' : 'border-white dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-900/30'">
                  
                  <div class="flex items-center gap-6">
                      <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shrink-0 flex items-center justify-center overflow-hidden border border-white dark:border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
                        <img *ngIf="layout.preview" [src]="layout.preview" class="w-full h-full object-cover">
                        <div *ngIf="!layout.preview" class="p-3 text-indigo-200 group-hover:text-indigo-500 transition-colors" [innerHTML]="layout.icon"></div>
                      </div>

                      <div class="flex-1">
                         <div class="flex items-center justify-between mb-2">
                            <h5 class="font-black text-gray-900 dark:text-white text-xl group-hover:text-indigo-600 transition-colors tracking-tighter">{{ layout.name }}</h5>
                            <div [class.scale-100]="selectedLayout === layout.id" class="scale-0 transition-transform duration-500 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                         </div>
                         <p class="text-[11px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest">{{ layout.description }}</p>
                      </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Adım 2: Özelleştirme -->
            <div *ngIf="step === 2" class="animate-fade-in space-y-10 pb-12">
                
                <!-- Bölüm: Üst Bilgi (Header) -->
                <div class="space-y-6 bg-white/40 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm">
                    <div class="flex items-center gap-4">
                        <div class="w-2 h-8 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full shadow-lg shadow-indigo-500/30"></div>
                        <div>
                          <h4 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Üst Bilgi</h4>
                          <p class="text-[10px] text-gray-400 font-bold">LOGO VE ARKAPLAN</p>
                        </div>
                    </div>
                    
                    <div class="space-y-6">
                       <!-- Logo Yönetimi -->
                       <div class="bg-indigo-50/30 dark:bg-black/20 p-6 rounded-3xl border border-indigo-100/50 dark:border-white/5">
                          <label class="block text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Marka Logosu</label>
                          <div class="flex flex-wrap items-center gap-4">
                             <div class="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden shadow-inner group/logo">
                                <img *ngIf="logoUrl" [src]="logoUrl" class="w-full h-full object-contain p-2">
                                <div *ngIf="!logoUrl" class="text-xs font-black text-gray-300 group-hover/logo:text-indigo-400 transition-colors">LOGO</div>
                             </div>
                             <div class="flex flex-col gap-2">
                                <input type="file" (change)="onFileSelected($event, 'logo')" class="hidden" #logoInput>
                                <button (click)="logoInput.click()" class="px-5 py-2.5 bg-indigo-600 text-white text-[11px] font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
                                  YÜKLE
                                </button>
                                <button (click)="openFileManager('logo')" class="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-white text-[11px] font-black rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
                                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                  DOSYALARIM
                                </button>
                             </div>
                          </div>
                       </div>

                       <!-- Header Renkleri -->
                       <div class="grid grid-cols-2 gap-3">
                           <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative group">
                               <label class="block text-[9px] font-bold text-gray-400 uppercase mb-2">Arka Plan</label>
                               <div class="flex items-center gap-2">
                                  <div class="w-6 h-6 rounded-lg shadow-inner shrink-0 border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                                      <input type="color" [(ngModel)]="headerBgColor" class="absolute -inset-2 cursor-pointer border-none bg-transparent w-10 h-10">
                                  </div>
                                  <input type="text" [(ngModel)]="headerBgColor" class="text-[10px] font-mono w-full dark:text-white uppercase bg-transparent border-none focus:ring-0 p-0 font-bold">
                               </div>
                           </div>
                           <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                               <label class="block text-[9px] font-bold text-gray-400 uppercase mb-2">Metin Rengi</label>
                               <div class="flex items-center gap-2">
                                  <div class="w-6 h-6 rounded-lg shadow-inner shrink-0 border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                                      <input type="color" [(ngModel)]="headerTextColor" class="absolute -inset-2 cursor-pointer border-none bg-transparent w-10 h-10">
                                  </div>
                                  <input type="text" [(ngModel)]="headerTextColor" class="text-[10px] w-full dark:text-white font-mono uppercase bg-transparent border-none focus:ring-0 p-0 font-bold">
                               </div>
                           </div>
                       </div>
                    </div>
                </div>

                <!-- Bölüm: Ana İçerik -->
                <div class="space-y-6 bg-white/40 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm">
                    <div class="flex items-center gap-4">
                        <div class="w-2 h-8 bg-gradient-to-b from-purple-600 to-fuchsia-600 rounded-full shadow-lg shadow-purple-500/30"></div>
                        <div>
                          <h4 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Ana İçerik</h4>
                          <p class="text-[10px] text-gray-400 font-bold">BAŞLIK, GÖRSEL VE METİN</p>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <!-- Banner Yönetimi (Layout'a Göre) -->
                        <div *ngIf="selectedLayout !== 'basic' && selectedLayout !== 'corporate'" class="bg-purple-50/30 dark:bg-black/20 p-6 rounded-3xl border border-purple-100/50 dark:border-white/5">
                            <label class="block text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4">Görsel Yönetimi (Banner)</label>
                            <div class="flex flex-wrap items-center gap-4">
                                <div class="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                    <img *ngIf="imageUrl" [src]="imageUrl" class="w-full h-full object-cover p-1">
                                    <div *ngIf="!imageUrl" class="text-xs font-black text-gray-300">BANNER</div>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <input type="file" (change)="onFileSelected($event, 'image')" class="hidden" #bannerInput>
                                    <button (click)="bannerInput.click()" class="px-5 py-2.5 bg-purple-600 text-white text-[11px] font-black rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2">
                                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
                                      YÜKLE
                                    </button>
                                    <button (click)="openFileManager('banner')" class="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-white text-[11px] font-black rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
                                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                      DOSYALARIM
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Galeri Yönetimi -->
                        <div *ngIf="selectedLayout === 'gallery2' || selectedLayout === 'gallery3'" class="bg-teal-50/30 dark:bg-black/20 p-6 rounded-3xl border border-teal-100/50 dark:border-white/5 space-y-4">
                             <label class="block text-[11px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-4">Galeri Resimleri</label>
                             <div class="grid grid-cols-1 gap-3">
                                <div *ngFor="let img of galleryImages; let i = index" class="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div class="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shrink-0 flex items-center justify-center overflow-hidden">
                                        <img [src]="img" class="w-full h-full object-cover p-1">
                                    </div>
                                    <div class="flex-1 relative">
                                        <input type="text" [(ngModel)]="galleryImages[i]" class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-lg p-2 text-[10px] dark:text-white shadow-sm outline-none">
                                        <div class="absolute right-1 top-1 flex gap-1">
                                            <button (click)="openFileManager('gallery', i)" class="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-gray-700 rounded transition-colors" title="Dosyalarım">
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19c0 1.1.9 2 2 2h10a2 2 0 002-2M7 10l5 5 5-5" /></svg>
                                            </button>
                                            <button (click)="galleryInput.click(); currentGalleryIndex = i" class="p-1.5 text-teal-500 hover:bg-teal-50 dark:hover:bg-gray-700 rounded transition-colors" title="Yükle">
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <input #galleryInput type="file" (change)="onFileSelected($event, 'gallery', currentGalleryIndex)" class="hidden" accept="image/*">
                             </div>
                        </div>

                        <div class="relative">
                            <input type="text" [(ngModel)]="contentTitle" 
                                   class="w-full bg-white dark:bg-gray-800 border-2 border-transparent focus:border-purple-400 rounded-2xl p-4 text-sm font-black outline-none shadow-md dark:text-white transition-all placeholder:text-gray-300" 
                                   placeholder="Ana Başlık Yazın...">
                        </div>
                        
                        <!-- Rich Text Editor -->
                        <div class="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-xl transition-all border-l-4 border-l-purple-500">
                            <div class="flex flex-wrap items-center gap-1 p-3 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-10">
                                <button (click)="execCommand('bold')" class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-lg transition-all dark:hover:bg-gray-700"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.6 15.5c0 2.2-1.8 4-4 4H7V4h4.6c1.8 0 3.3 1.5 3.3 3.3 0 1.2-.6 2.3-1.6 2.9 1 .6 1.6 1.7 1.6 2.9 0 1.3-.3 2.5-1 3.4zM11.6 7.3H9.3v3.7h2.3c1 0 1.7-.8 1.7-1.8.1-1.1-.7-1.9-1.7-1.9zm.6 8.2c0-1.1-.9-2.1-1.9-2.1H9.3v4.1h1c1 0 1.9-.9 1.9-2z" /></svg></button>
                                <button (click)="execCommand('italic')" class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-lg transition-all dark:hover:bg-gray-700"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg></button>
                                <div class="w-[2px] h-4 bg-gray-200 dark:bg-gray-700 mx-2 rounded-full"></div>
                                <button (click)="execCommand('justifyLeft')" class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-lg transition-all dark:hover:bg-gray-700"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h10M4 18h16" /></svg></button>
                                <button (click)="execCommand('justifyCenter')" class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-lg transition-all dark:hover:bg-gray-700"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M7 12h10M4 18h16" /></svg></button>
                            </div>
                            <div #editor contenteditable="true" (input)="onEditorInput()" 
                                 class="p-6 min-h-[180px] outline-none text-sm dark:text-gray-200 leading-[1.8] tracking-tight"
                                 [innerHTML]="initialEditorContent">
                            </div>
                        </div>

                        <!-- Panel Renkleri -->
                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-2">Panel Zemin</label>
                                <div class="flex items-center gap-2">
                                  <input type="color" [(ngModel)]="bgColor" class="w-6 h-6 border-none cursor-pointer bg-transparent">
                                  <input type="text" [(ngModel)]="bgColor" class="text-[10px] w-full dark:text-white font-mono uppercase bg-transparent p-0 border-none">
                                </div>
                            </div>
                            <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <label class="block text-[9px] font-bold text-gray-400 uppercase mb-2">Genel Metin</label>
                                <div class="flex items-center gap-2">
                                  <input type="color" [(ngModel)]="textColor" class="w-6 h-6 border-none cursor-pointer bg-transparent">
                                  <input type="text" [(ngModel)]="textColor" class="text-[10px] w-full dark:text-white font-mono uppercase bg-transparent p-0 border-none">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bölüm: Alt Bilgi (Footer) -->
                <div class="space-y-6 bg-white/40 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm">
                    <div class="flex items-center gap-4">
                        <div class="w-2 h-8 bg-gradient-to-b from-slate-600 to-gray-600 rounded-full shadow-lg shadow-slate-500/30"></div>
                        <div>
                          <h4 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Alt Bilgi</h4>
                          <p class="text-[10px] text-gray-400 font-bold">METİN VE ARKAPLAN</p>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="relative">
                            <textarea [(ngModel)]="footerText" rows="2"
                                   class="w-full bg-white dark:bg-gray-800 border-2 border-transparent focus:border-slate-400 rounded-2xl p-4 text-xs font-medium outline-none shadow-md dark:text-white transition-all placeholder:text-gray-300 resize-none" 
                                   placeholder="Alt bilgi metni veya telif hakkı yazısı..."></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                           <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                               <label class="block text-[9px] font-bold text-gray-400 uppercase mb-2">Alt Zemin</label>
                               <div class="flex items-center gap-2">
                                  <input type="color" [(ngModel)]="footerBgColor" class="w-6 h-6 border-none cursor-pointer bg-transparent">
                                  <input type="text" [(ngModel)]="footerBgColor" class="text-[10px] w-full dark:text-white font-mono uppercase bg-transparent p-0 border-none">
                               </div>
                           </div>
                           <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                               <label class="block text-[9px] font-bold text-gray-400 uppercase mb-2">Alt Metin</label>
                               <div class="flex items-center gap-2">
                                  <input type="color" [(ngModel)]="footerTextColor" class="w-6 h-6 border-none cursor-pointer bg-transparent">
                                  <input type="text" [(ngModel)]="footerTextColor" class="text-[10px] w-full dark:text-white font-mono uppercase bg-transparent p-0 border-none">
                               </div>
                           </div>
                       </div>
                    </div>
                </div>

                <!-- Bölüm: Eylem Butonu -->
                <div class="space-y-6 bg-white/40 dark:bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-sm">
                    <div class="flex items-center justify-between">
                       <div class="flex items-center gap-4">
                           <div class="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-500/30"></div>
                           <div>
                             <h4 class="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Eylem Butonu</h4>
                             <p class="text-[10px] text-gray-400 font-bold">BUTON METNİ VE BAĞLANTISI</p>
                           </div>
                       </div>
                       <label class="relative inline-flex items-center cursor-pointer">
                         <input type="checkbox" [(ngModel)]="showButton" class="sr-only peer">
                         <div class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                       </label>
                    </div>

                    <div *ngIf="showButton" class="p-8 bg-white/60 dark:bg-black/30 rounded-[2rem] border border-white dark:border-white/5 shadow-2xl space-y-6 animate-scale-in">
                        <div class="grid grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Buton Metni</label>
                                <input type="text" [(ngModel)]="buttonText" class="w-full bg-white dark:bg-gray-800 border-none rounded-xl p-4 text-xs font-black shadow-inner focus:ring-4 focus:ring-orange-500/10 dark:text-white transition-all">
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Buton Rengi</label>
                                <div class="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
                                   <input type="color" [(ngModel)]="buttonColor" class="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent">
                                   <input type="text" [(ngModel)]="buttonColor" class="text-[10px] w-full dark:text-white font-mono uppercase bg-transparent p-0 border-none font-bold">
                                </div>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Hedef Bağlantı (URL)</label>
                            <input type="text" [(ngModel)]="buttonUrl" placeholder="https://..." class="w-full bg-white dark:bg-gray-800 border-none rounded-xl p-4 text-xs font-bold shadow-inner focus:ring-4 focus:ring-orange-500/10 dark:text-white transition-all">
                        </div>
                </div>
            </div>
          </div>
        </div>

          <!-- Sağ Panel: Önizleme -->
          <div class="flex-1 bg-gray-50/50 dark:bg-black/20 p-10 flex flex-col items-center justify-center relative group/preview overflow-hidden">
            
            <!-- Real-time Status Badge -->
            <div class="absolute top-8 left-8 flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 py-2 rounded-full border border-white dark:border-white/10 shadow-lg z-10 transition-all">
                <div class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span class="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">CANLI ÖNİZLEME</span>
            </div>

            <!-- Floating Preview Controls -->
            <div class="absolute top-8 right-8 flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-white dark:border-white/10 z-10 transition-all">
               <button (click)="isMobilePreview = false" [class.bg-indigo-600]="!isMobilePreview" [class.text-white]="!isMobilePreview" class="p-3 rounded-xl transition-all shadow-lg active:scale-95"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></button>
               <button (click)="isMobilePreview = true" [class.bg-indigo-600]="isMobilePreview" [class.text-white]="isMobilePreview" class="p-3 rounded-xl transition-all shadow-lg active:scale-95"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></button>
            </div>

            <!-- Canvas Container (Device Frame Effect) -->
            <div [class.w-[375px]]="isMobilePreview" [class.w-full]="!isMobilePreview" [class.max-w-4xl]="!isMobilePreview" 
                 class="h-full bg-white dark:bg-gray-950 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] rounded-[3.5rem] overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-[12px] border-gray-950/95 dark:border-white/5 relative">
              
              <!-- Notch for Mobile -->
              <div *ngIf="isMobilePreview" class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-gray-950 rounded-b-3xl z-30 flex items-center justify-center">
                  <div class="w-16 h-1.5 bg-gray-800 rounded-full"></div>
              </div>

              <!-- Content Scrollable Viewport -->
              <div class="h-full overflow-y-auto custom-scrollbar-thin bg-white dark:bg-gray-900 transition-colors" [style.backgroundColor]="bgColor">
                  <div class="p-0 border-t-[8px]" [style.borderColor]="themeColor">
                               
                                <!-- Önizleme Header -->
                                <div class="p-6 text-center border-b border-gray-100 dark:border-gray-800/30 transition-colors" [style.background-color]="headerBgColor">
                                   <img *ngIf="logoUrl" [src]="logoUrl" class="h-10 mx-auto object-contain transition-all hover:scale-105">
                                   <span *ngIf="!logoUrl" class="text-sm font-black uppercase tracking-widest" [style.color]="headerTextColor">MARKA LOGO</span>
                                </div>

                                <!-- Düzen Öğeleri -->
                                <div *ngIf="selectedLayout === 'newsletter'" class="p-10 text-center" [style.backgroundColor]="themeColor">
                                    <h1 class="text-2xl font-black text-white leading-tight drop-shadow-md">{{ contentTitle || 'Yaratıcı Bir Başlık' }}</h1>
                                </div>

                                <div *ngIf="selectedLayout === 'hero' && imageUrl" class="w-full aspect-video overflow-hidden">
                                    <img [src]="imageUrl" class="w-full h-full object-cover">
                                </div>

                                <div *ngIf="selectedLayout === 'gallery2' || selectedLayout === 'gallery3'" class="p-6 flex gap-2 items-stretch">
                                     <div *ngFor="let img of galleryImages" class="flex-1 bg-gray-50 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                                         <img [src]="img" class="w-full h-full object-cover min-h-[100px]">
                                     </div>
                                </div>
                                
                                <div *ngIf="selectedLayout === 'event'" class="text-center p-8 border-b-2 border-dashed border-gray-100 dark:border-gray-800">
                                     <span class="inline-block px-5 py-2 rounded-2xl text-white font-black text-[11px] tracking-widest mb-4 shadow-lg shadow-indigo-500/20" [style.backgroundColor]="themeColor">ÖZEL ETKİNLİK</span>
                                     <h2 class="text-3xl font-black text-gray-900 dark:text-white leading-tight transition-colors" [style.color]="titleColor">{{ contentTitle || 'Unutulmaz Bir Deneyim' }}</h2>
                                </div>

                                <!-- Ana İçerik Alanı -->
                                <div class="p-10">
                                    <h1 *ngIf="contentTitle && selectedLayout !== 'newsletter' && selectedLayout !== 'event'" 
                                        class="text-3xl font-black mb-8 leading-[1.2] tracking-tight transition-colors" [style.color]="titleColor">{{ contentTitle }}</h1>
                                    
                                    <div class="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-4 transition-colors" 
                                         [innerHTML]="editorContent || initialEditorContent" [style.color]="textColor"></div>
                                    
                                    <!-- Eylem Butonu -->
                                    <div *ngIf="showButton" class="mt-12" [style.textAlign]="buttonAlign">
                                        <a (click)="$event.preventDefault()" [href]="buttonUrl" class="inline-block px-10 py-5 rounded-[1.5rem] font-black shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 no-underline cursor-pointer"
                                           [style.backgroundColor]="buttonColor" [style.color]="buttonTextColor" [style.boxShadow]="'0 20px 40px -10px ' + buttonColor + '44'">
                                           {{ buttonText }}
                                        </a>
                                    </div>
                                </div>

                                <!-- Önizleme Footer -->
                                <div class="p-10 text-center border-t border-gray-100 dark:border-gray-800 transition-colors" [style.background-color]="footerBgColor">
                                    <p class="text-[11px] font-medium leading-relaxed" [style.color]="footerTextColor">
                                        {{ footerText || '© 2026 Mailim Studio. Tüm hakları saklıdır.' }}
                                    </p>
                                </div>
                            </div>
                        </div>
                   </div>
               </div>
          </div>

        <!-- Alt İşlem Çubuğu -->
        <div class="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-[2.5rem] flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <button (click)="changeLayout()" *ngIf="step === 2" class="px-7 py-4 text-xs font-black text-gray-500 hover:text-indigo-600 transition-all flex items-center gap-3 group">
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" /></svg>
            DÜZENİ DEĞİŞTİR
          </button>
          
          <div *ngIf="step === 1" class="grow"></div>
          
          <div class="flex items-center gap-6">
              <button (click)="close()" class="text-xs font-black text-gray-400 hover:text-gray-900 dark:hover:text-white tracking-widest transition-colors">İPTAL</button>
              <button (click)="generate()" *ngIf="step === 2" class="px-10 py-4 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 flex items-center gap-3 group active:scale-95">
                TASARIMI TAMAMLA
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
          </div>
        </div>
      </div>

      <!-- Dosya Yöneticisi Overlay -->
      <div *ngIf="isFileManagerOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
        <div class="bg-white dark:bg-gray-900 w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden border border-white/10 scale-in">
            <!-- Modal Header -->
            <div class="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/30">
                        <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5M5 19c0 1.1.9 2 2 2h10a2 2 0 002-2M7 10l5 5 5-5" /></svg>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-gray-900 dark:text-white">Dosyalarım</h3>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Daha önce yüklediğiniz görseller</p>
                    </div>
                </div>
                <button (click)="isFileManagerOpen = false" class="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <!-- Image Grid -->
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
                <div *ngIf="myImages.length === 0" class="h-full flex flex-col items-center justify-center opacity-40">
                    <svg class="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p class="font-bold text-sm">Henüz hiçbir görsel yüklemediniz.</p>
                </div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <div *ngFor="let img of myImages" (click)="selectFromFileManager(img)"
                         class="group relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-amber-500 hover:shadow-2xl transition-all duration-300">
                        <img [src]="img" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span class="px-4 py-2 bg-amber-500 text-white text-[10px] font-black rounded-lg shadow-lg">SEÇ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
    .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1); }
    .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .scale-in { animation: modalScaleIn 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    @keyframes modalScaleIn { from { transform: scale(0.96) translateY(30px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-indigo-300 transition-colors; }
    
    .custom-scrollbar-thin::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar-thin::-webkit-scrollbar-track { @apply bg-transparent; }
    .custom-scrollbar-thin::-webkit-scrollbar-thumb { @apply bg-gray-200/40 dark:bg-gray-800/40 rounded-full; }
  `]
})
export class MailTemplateWizardComponent implements AfterViewInit {
  @Output() onGenerate = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('editor') editorRef!: ElementRef;

  step = 1;
  selectedLayout: 'basic' | 'newsletter' | 'hero' | 'product' | 'event' | 'corporate' | 'gallery2' | 'gallery3' | null = null;
  isMobilePreview = false;
  isUploading = false;
  currentGalleryIndex: number | null = null;

  // Dosya Yöneticisi
  isFileManagerOpen = false;
  myImages: string[] = [];
  fileManagerTarget: 'logo' | 'banner' | 'gallery' = 'logo';

  layouts = [
    { id: 'basic', name: 'Zarif Minimal', description: 'Metin odaklı, sade ve profesyonel mizanpaj.', icon: '<svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>' },
    { id: 'newsletter', name: 'Yaratıcı Bülten', description: 'Görsel dengesi yüksek, haber bülteni stili.', preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80' },
    { id: 'hero', name: 'Ekili Manşet', description: 'Devasa kapak görseli ile ilk bakışta etkile.', preview: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&q=80' },
    { id: 'product', name: 'Ürün Vitrini', description: 'Tek ürün veya özellik tanıtımı için ideal.', preview: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
    { id: 'event', name: 'Premium Davetiye', description: 'Özel etkinlik ve toplantı davetiyeleri.', preview: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80' },
    { id: 'corporate', name: 'Resmi Yazışma', description: 'Resmi kurumsal dilde minimalist iletişim.', preview: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&q=80' },
    { id: 'gallery2', name: 'Görsel İkili', description: 'İkili görsel anlatımı sunan şık galeri.', preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80' },
    { id: 'gallery3', name: 'Üçlü Koleksiyon', description: 'Üçlü ızgara yapısında ürün/hizmet listesi.', preview: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80' }
  ];

  // Renk ve İçerik Yönetimi
  themeColor = '#4f46e5';
  bgColor = '#ffffff';
  textColor = '#374151';
  titleColor = '#111827';

  // Header Özelleştirme
  headerBgColor = '#ffffff';
  headerTextColor = '#111827';
  logoUrl = '';

  // Footer Özelleştirme
  footerBgColor = '#f9fafb';
  footerTextColor = '#9ca3af';
  footerText = '© 2026 Şirketiniz. Tüm Hakları Saklıdır.';

  // Ana İçerik
  contentTitle = 'Başlığınız Buraya!';
  imageUrl = 'https://via.placeholder.com/800x400/f3f4f6/374151?text=BANNER+GÖRSELİ';
  galleryImages: string[] = [];

  // Editör
  initialEditorContent = '<p>Mesajınızı buraya yazmaya başlayın.</p><p>Üstteki araçları kullanarak yazı tipini ve hizalamayı değiştirebilirsiniz.</p>';
  editorContent = '';

  // Buton
  showButton = true;
  buttonText = 'HEMEN İNCELE';
  buttonUrl = 'https://';
  buttonColor = '#4f46e5';
  buttonTextColor = '#ffffff';
  buttonAlign: 'left' | 'center' | 'right' = 'center';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private confirmDialog: ConfirmDialogService
  ) { }

  ngAfterViewInit() {
    this.editorContent = this.initialEditorContent;
  }

  selectLayout(layout: any) {
    this.selectedLayout = layout;
    this.resetDefaults();
    this.step = 2;

    setTimeout(() => {
      if (this.editorRef) {
        this.editorRef.nativeElement.focus();
      }
    }, 100);
  }

  async changeLayout() {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Düzeni Değiştir',
      message: 'Düzeni değiştirmek mevcut tüm tasarım ayarlarınızı ve içeriğinizi sıfırlayacaktır. Devam etmek istiyor musunuz?',
      confirmText: 'EVET, SIFIRLA',
      cancelText: 'İPTAL',
      type: 'warning'
    });

    if (confirmed) {
      this.step = 1;
      this.selectedLayout = null;
    }
  }

  resetDefaults() {
    // Renkler
    this.themeColor = '#4f46e5';
    this.bgColor = '#ffffff';
    this.textColor = '#374151';
    this.titleColor = '#111827';

    // Header
    this.headerBgColor = '#ffffff';
    this.headerTextColor = '#111827';
    this.logoUrl = '';

    // Footer
    this.footerBgColor = '#f9fafb';
    this.footerTextColor = '#9ca3af';
    this.footerText = '© 2026 Şirketiniz. Tüm Hakları Saklıdır.';

    // İçerik
    this.contentTitle = 'Başlığınız Buraya!';
    this.imageUrl = 'https://via.placeholder.com/800x400/f3f4f6/374151?text=BANNER+GÖRSELİ';

    // Editör
    this.editorContent = this.initialEditorContent;
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.initialEditorContent;
    }

    // Buton
    this.showButton = true;
    this.buttonText = 'HEMEN İNCELE';
    this.buttonUrl = 'https://';
    this.buttonColor = this.themeColor;
    this.buttonTextColor = '#ffffff';
    this.buttonAlign = 'center';

    // Layout spesifik ayarlar
    if (this.selectedLayout === 'gallery2') {
      this.galleryImages = ['https://via.placeholder.com/400x300', 'https://via.placeholder.com/400x300'];
      this.showButton = false;
    } else if (this.selectedLayout === 'gallery3') {
      this.galleryImages = ['https://via.placeholder.com/300x300', 'https://via.placeholder.com/300x300', 'https://via.placeholder.com/300x300'];
      this.showButton = false;
    } else {
      this.galleryImages = [];
    }
  }

  onFileSelected(event: any, type: 'logo' | 'image' | 'gallery', index: number | null = null) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>(`${environment.apiUrl}/FileUpload/upload-image`, formData).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.isSuccess) {
          const fullUrl = environment.apiUrl.replace('/api', '') + res.data;
          if (type === 'logo') this.logoUrl = fullUrl;
          else if (type === 'image') this.imageUrl = fullUrl;
          else if (type === 'gallery' && index !== null) {
            this.galleryImages[index] = fullUrl;
          }
          this.toastr.success('Dosya başarıyla yüklendi.', 'Başarılı');
        } else {
          this.toastr.error(res.message, 'Hata');
        }
      },
      error: () => {
        this.isUploading = false;
        this.toastr.error('Dosya yüklenirken bir ağ hatası oluştu.', 'Hata');
      }
    });
  }

  // Dosya Yöneticisi İşlemleri
  openFileManager(target: 'logo' | 'banner' | 'gallery', index: number | null = null) {
    this.fileManagerTarget = target;
    this.currentGalleryIndex = index;
    this.loadMyImages();
    this.isFileManagerOpen = true;
  }

  loadMyImages() {
    this.http.get<string[]>(`${environment.apiUrl}/FileUpload/my-images`).subscribe({
      next: (images) => {
        const baseUrl = environment.apiUrl.replace('/api', '');
        this.myImages = images.map(img => img.startsWith('http') ? img : baseUrl + img);
      },
      error: () => this.toastr.error('Resimler yüklenirken hata oluştu.', 'Hata')
    });
  }

  selectFromFileManager(url: string) {
    if (this.fileManagerTarget === 'logo') this.logoUrl = url;
    else if (this.fileManagerTarget === 'banner') this.imageUrl = url;
    else if (this.fileManagerTarget === 'gallery' && this.currentGalleryIndex !== null) {
      this.galleryImages[this.currentGalleryIndex] = url;
    }
    this.isFileManagerOpen = false;
  }

  onEditorInput() {
    if (this.editorRef) {
      this.editorContent = this.editorRef.nativeElement.innerHTML;
    }
  }

  execCommand(command: string) {
    document.execCommand(command, false);
    this.onEditorInput();
    this.editorRef.nativeElement.focus();
  }

  close() {
    this.onClose.emit();
  }

  generate() {
    const html = this.generateHtml();
    this.onGenerate.emit(html);
  }

  generateHtml(): string {
    const pStyle = `margin: 0 0 15px 0; line-height: 1.6; color: ${this.textColor};`;
    let processedContent = this.editorContent
      .replace(/<p>/g, `<p style="${pStyle}">`)
      .replace(/<div>/g, `<div style="${pStyle}">`);

    const containerStyle = `max-width: 600px; margin: 40px auto; background-color: ${this.bgColor}; border-radius: 24px; overflow: hidden; box-shadow: 0 40px 80px -10px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;`;

    let heroArea = '';
    if (this.selectedLayout === 'newsletter') {
      heroArea = `<div style="background-color: ${this.themeColor}; padding: 60px 40px; text-align: center;"><h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -1px;">${this.contentTitle}</h1></div>`;
    } else if (this.selectedLayout === 'hero' && this.imageUrl) {
      heroArea = `<img src="${this.imageUrl}" style="width: 100%; display: block;">`;
    } else if (this.selectedLayout === 'gallery2' || this.selectedLayout === 'gallery3') {
      let cells = '';
      this.galleryImages.forEach(img => {
        cells += `<td style="padding: 10px;"><img src="${img}" style="width: 100%; border-radius: 16px; display: block;"></td>`;
      });
      heroArea = `<div style="padding: 20px;"><table style="width: 100%; border-collapse: collapse;"><tr>${cells}</tr></table></div>`;
    }

    let buttonHtml = '';
    if (this.showButton) {
      buttonHtml = `
        <div style="margin-top: 40px; text-align: ${this.buttonAlign};">
            <a href="${this.buttonUrl}" style="display: inline-block; padding: 18px 36px; background-color: ${this.buttonColor}; color: ${this.buttonTextColor}; text-decoration: none; border-radius: 16px; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">${this.buttonText}</a>
        </div>`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="${containerStyle}">
        <!-- Header -->
        <div style="background-color: ${this.headerBgColor}; padding: 30px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.05);">
            ${this.logoUrl ? `<img src="${this.logoUrl}" style="max-height: 48px; max-width: 200px; width: auto;">` : `<span style="font-size: 18px; font-weight: 900; color: ${this.headerTextColor}; letter-spacing: 2px;">LOGO</span>`}
        </div>

        ${heroArea}

        <!-- Content -->
        <div style="padding: 50px 40px;">
            ${(this.contentTitle && this.selectedLayout !== 'newsletter') ? `<h1 style="color: ${this.titleColor}; font-size: 28px; font-weight: 800; margin-bottom: 25px; line-height: 1.2; letter-spacing: -0.5px;">${this.contentTitle}</h1>` : ''}
            <div style="font-size: 16px; color: ${this.textColor}; font-weight: 400;">
                ${processedContent}
            </div>
            ${buttonHtml}
        </div>

        <!-- Footer -->
        <div style="background-color: ${this.footerBgColor}; padding: 40px; text-align: center; border-top: 1px solid rgba(0,0,0,0.05);">
            <p style="margin: 0; font-size: 12px; color: ${this.footerTextColor}; line-height: 1.5;">${this.footerText}</p>
        </div>
    </div>
</body>
</html>`;
  }
}
