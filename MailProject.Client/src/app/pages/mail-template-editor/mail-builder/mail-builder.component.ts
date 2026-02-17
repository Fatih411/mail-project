import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MailBlock, MailGeneratorService } from '../../../services/mail-generator.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
    selector: 'app-mail-builder',
    standalone: true,
    imports: [CommonModule, FormsModule, DragDropModule],
    template: `
    <div class="flex h-[85vh] bg-slate-50 dark:bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)]">
      
      <!-- Sol Panel: Bileşenler -->
      <div class="w-72 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 p-6 flex flex-col shadow-xl z-10">
        <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Kütüphane</h3>
        </div>
        
        <div class="space-y-6 overflow-y-auto custom-scrollbar pr-1">
            <div *ngFor="let group of componentGroups">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">{{ group.title }}</p>
                <div cdkDropList 
                     [cdkDropListData]="group.blocks"
                     [cdkDropListConnectedTo]="['canvasList']"
                     class="grid grid-cols-2 gap-3">
                    <div *ngFor="let block of group.blocks" 
                         cdkDrag 
                         [cdkDragData]="block"
                         class="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 cursor-grab hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group active:cursor-grabbing">
                        <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shadow-sm mb-3" [innerHTML]="getBlockIcon(block.type)"></div>
                        <p class="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-center line-clamp-1">{{ getBlockName(block.type) }}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <!-- Orta Panel: Kanvas -->
      <div class="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] p-12 flex flex-col items-center">
        
        <!-- Cihaz Değiştirici -->
        <div class="flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl mb-10 gap-1">
            <button (click)="previewMode = 'desktop'" [class.bg-indigo-600]="previewMode === 'desktop'" [class.text-white]="previewMode === 'desktop'" class="px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                DESKTOP
            </button>
            <button (click)="previewMode = 'mobile'" [class.bg-indigo-600]="previewMode === 'mobile'" [class.text-white]="previewMode === 'mobile'" class="px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                MOBILE
            </button>
        </div>

        <div [class.max-w-[600px]]="previewMode === 'desktop'" 
             [class.max-w-[375px]]="previewMode === 'mobile'"
             class="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border-4 border-slate-100 dark:border-slate-800 transition-all duration-700 ease-in-out relative overflow-hidden">
            
            <div id="canvasList"
                 cdkDropList
                 [cdkDropListData]="canvasBlocks"
                 (cdkDropListDropped)="onDrop($event)"
                 class="min-h-[700px] flex flex-col items-center">
                
                <div *ngIf="canvasBlocks.length === 0" class="flex-1 w-full flex flex-col items-center justify-center p-20 text-center">
                    <div class="relative mb-12">
                        <div class="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full"></div>
                        <div class="w-32 h-32 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center relative shadow-2xl border border-slate-100 dark:border-slate-700 animate-bounce-slow">
                            <svg class="w-16 h-16 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                    
                    <h2 class="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4 animate-fade-in">Sihirli Tasarım Başlasın</h2>
                    <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-bold text-sm leading-relaxed mb-10">AI ile saniyeler içinde profesyonel bir e-posta hazırlayın. İsteğinizi aşağıya yazın.</p>
                    
                    <div class="w-full max-w-xl relative group">
                        <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div class="relative flex items-center bg-white dark:bg-slate-800 p-2 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-700">
                            <input [(ngModel)]="aiPrompt" (keyup.enter)="generateAIDesign()" placeholder="Örn: Modern bir hoşgeldin maili hazırla..." class="flex-1 bg-transparent border-none focus:ring-0 p-4 text-sm font-bold dark:text-white placeholder-slate-400">
                            <button (click)="generateAIDesign()" [disabled]="isGenerating" class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <svg *ngIf="isGenerating" class="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {{ isGenerating ? 'AI OLUŞTURUYOR...' : 'OLUŞTUR' }}
                            </button>
                        </div>
                    </div>
                </div>

                <div *ngFor="let block of canvasBlocks; let i = index" 
                     cdkDrag
                     (click)="selectBlock(block)"
                     [class.ring-4]="selectedBlock?.id === block.id"
                     class="group/item w-full relative hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all cursor-pointer ring-indigo-500 ring-offset-0">
                  
                  <!-- Hızlı Aksiyon Menüsü -->
                  <div class="absolute -right-2 top-0 flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-all z-20 -translate-y-full pb-2">
                    <div class="flex bg-slate-900 dark:bg-white p-1 rounded-xl shadow-2xl scale-90 group-hover/item:scale-100 transition-transform origin-bottom">
                        <button (click)="removeBlock(i); $event.stopPropagation()" class="p-2 text-white dark:text-slate-900 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <button (click)="duplicateBlock(i); $event.stopPropagation()" class="p-2 text-white dark:text-slate-900 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                        </button>
                        <div cdkDragHandle class="p-2 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100 rounded-lg transition-colors cursor-move">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8h16M4 16h16" /></svg>
                        </div>
                    </div>
                  </div>

                  <!-- Rendered Preview -->
                  <div class="pointer-events-none w-full" [innerHTML]="renderBlockPreview(block)"></div>
                </div>
            </div>
        </div>
      </div>

      <!-- Sağ Panel: Detaylı Denetleyici -->
      <div class="w-80 shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-8 flex flex-col z-10 shadow-2xl transition-all duration-300">
        <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <h3 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Özellikler</h3>
        </div>

        <div *ngIf="!selectedBlock" class="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700/50">
            <div class="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 text-slate-300 shadow-xl border border-slate-100 dark:border-slate-700">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>
            </div>
            <p class="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Odak Noktası Bekleniyor</p>
            <p class="text-[11px] text-slate-400 mt-3 font-bold leading-relaxed">Düzenlemeye başlamak için bir blok seçin.</p>
        </div>

        <div *ngIf="selectedBlock" class="flex-1 space-y-8 animate-fade-in custom-scrollbar overflow-y-auto pr-2">
            
            <!-- İçerik Bölümü -->
            <section class="space-y-4">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">İçerik Editörü</p>
                
                <div *ngIf="selectedBlock?.content !== undefined">
                    <div class="flex justify-between items-center mb-2 ml-1">
                        <label class="block text-[9px] font-black text-slate-400 uppercase">Metin İçeriği</label>
                        <button (click)="askAIForText(selectedBlock!)" class="text-[9px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-all">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            AI İLE YAZ
                        </button>
                    </div>
                    <textarea [(ngModel)]="selectedBlock!.content" (ngModelChange)="updateFullHtml()" rows="4" class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 text-[13px] font-bold dark:text-white transition-all resize-none shadow-sm" placeholder="Metin yazın..."></textarea>
                </div>

                <div *ngIf="selectedBlock?.type === 'header'" class="space-y-4">
                    <div>
                        <label class="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Logo URL</label>
                        <input [(ngModel)]="selectedBlock!.config!.logoUrl" (ngModelChange)="updateFullHtml()" type="text" placeholder="https://..." class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold dark:text-white">
                    </div>
                </div>

                <div *ngIf="selectedBlock?.type === 'button' || selectedBlock?.type === 'image'">
                    <div class="flex justify-between items-center mb-2 ml-1">
                        <label class="block text-[9px] font-black text-slate-400 uppercase">Hedef Link (URL)</label>
                        <button *ngIf="selectedBlock?.type === 'button'" (click)="askAIForText(selectedBlock!)" class="text-[9px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-all">
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            AI ÖNERİ
                        </button>
                    </div>
                    <input [(ngModel)]="selectedBlock!.config!.url" (ngModelChange)="updateFullHtml()" type="text" placeholder="https://..." class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-xl p-3.5 text-xs font-bold dark:text-white transition-all shadow-sm">
                </div>

                <div *ngIf="selectedBlock?.type === 'spacer'">
                    <label class="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Yükseklik (PX)</label>
                    <input [(ngModel)]="selectedBlock!.config!.height" (ngModelChange)="updateFullHtml()" type="number" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold dark:text-white">
                </div>

                <!-- Sosyal Linkler -->
                <div *ngIf="selectedBlock?.type === 'social'" class="space-y-3">
                    <div *ngFor="let link of selectedBlock?.config?.socialLinks; let li = index" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all">
                        <div class="flex justify-between items-center mb-3">
                            <div class="flex items-center gap-2">
                                <span class="text-[9px] font-black text-indigo-500 uppercase">{{ link.type }}</span>
                                <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            </div>
                            <button (click)="selectedBlock!.config!.socialLinks!.splice(li, 1); updateFullHtml()" class="text-slate-400 hover:text-red-500 transition-colors">
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div class="flex gap-2">
                            <select [(ngModel)]="link.type" (ngModelChange)="updateFullHtml()" class="bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-[10px] font-bold dark:text-white w-24">
                                <option value="facebook">FB</option>
                                <option value="twitter">X</option>
                                <option value="instagram">IG</option>
                                <option value="linkedin">LI</option>
                                <option value="web">WEB</option>
                            </select>
                            <input [(ngModel)]="link.url" (ngModelChange)="updateFullHtml()" type="text" class="flex-1 bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-[10px] font-bold dark:text-white" placeholder="URL girin...">
                        </div>
                    </div>
                    <button (click)="selectedBlock!.config!.socialLinks!.push({type: 'web', url: '#'}); updateFullHtml()" class="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all uppercase tracking-widest">+ Link Ekle</button>
                </div>
            </section>

            <!-- Stil Bölümü -->
            <section class="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Stil ve Görünüm</p>
                
                <!-- Tipografi -->
                <div *ngIf="selectedBlock?.styles?.fontSize !== undefined" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Yazı Boyutu</label>
                            <input type="number" [(ngModel)]="selectedBlock!.styles!.fontSize" (ngModelChange)="updateFullHtml()" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold dark:text-white">
                        </div>
                        <div>
                            <label class="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Font Ailesi</label>
                            <select [(ngModel)]="selectedBlock!.styles!.fontFamily" (ngModelChange)="updateFullHtml()" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold dark:text-white">
                                <option value="inherit">Varsayılan</option>
                                <option value="'Outfit', sans-serif">Outfit</option>
                                <option value="'Inter', sans-serif">Inter</option>
                                <option value="Georgia, serif">Serif</option>
                                <option value="monospace">Monospace</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Renkler -->
                <div class="grid grid-cols-2 gap-4">
                    <div *ngIf="selectedBlock?.styles?.bgColor !== undefined || selectedBlock?.type === 'header'">
                        <label class="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Arkaplan</label>
                        <div class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden min-w-0">
                            <input type="color" [ngModel]="selectedBlock?.type === 'header' ? selectedBlock!.config!.bgColor : selectedBlock!.styles!.bgColor" (ngModelChange)="selectedBlock?.type === 'header' ? selectedBlock!.config!.bgColor = $event : selectedBlock!.styles!.bgColor = $event; updateFullHtml()" class="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent">
                            <span class="text-[10px] font-mono font-bold dark:text-white truncate uppercase">{{ (selectedBlock?.type === 'header' ? (selectedBlock!.config!.bgColor || '#FFFFFF') : (selectedBlock!.styles!.bgColor || '#FFFFFF')) }}</span>
                        </div>
                    </div>
                    <div *ngIf="selectedBlock?.styles?.color !== undefined || selectedBlock?.type === 'header'">
                        <label class="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Metin/Tema</label>
                        <div class="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden min-w-0">
                            <input type="color" [ngModel]="selectedBlock?.type === 'header' ? selectedBlock!.config!.textColor : selectedBlock!.styles!.color" (ngModelChange)="selectedBlock?.type === 'header' ? selectedBlock!.config!.textColor = $event : selectedBlock!.styles!.color = $event; updateFullHtml()" class="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent">
                            <span class="text-[10px] font-mono font-bold dark:text-white truncate uppercase">{{ (selectedBlock?.type === 'header' ? (selectedBlock!.config!.textColor || '#000000') : (selectedBlock!.styles!.color || '#000000')) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Padding / Boşluklar -->
                <div *ngIf="selectedBlock?.styles?.paddingTop !== undefined" class="space-y-4">
                    <div class="flex justify-between items-center">
                        <label class="text-[9px] font-black text-slate-400 uppercase">Dikey Boşluk (Padding)</label>
                        <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{{ selectedBlock!.styles!.paddingTop }}px</span>
                    </div>
                    <input type="range" min="0" max="100" step="5" [(ngModel)]="selectedBlock!.styles!.paddingTop" (ngModelChange)="selectedBlock!.styles!.paddingBottom = selectedBlock!.styles!.paddingTop; updateFullHtml()" class="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer">
                </div>

                <!-- Hizalama -->
                <div *ngIf="selectedBlock?.styles?.align !== undefined" class="space-y-3">
                    <label class="text-[9px] font-black text-slate-400 uppercase block">Hizalama</label>
                    <div class="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-100 dark:border-slate-700/50">
                        <button *ngFor="let al of ['left', 'center', 'right']" (click)="selectedBlock!.styles!.align = $any(al); updateFullHtml()" [class.bg-white]="selectedBlock!.styles!.align === al" [class.dark:bg-slate-700]="selectedBlock!.styles!.align === al" [class.shadow-md]="selectedBlock!.styles!.align === al" class="flex-1 py-2 text-xs font-black transition-all rounded-lg uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" [class.text-indigo-600]="selectedBlock!.styles!.align === al">
                            {{ al.substring(0,1) }}
                        </button>
                    </div>
                </div>

                <!-- Köşe Yuvarlatma -->
                <div *ngIf="selectedBlock?.styles?.borderRadius !== undefined" class="space-y-4">
                    <div class="flex justify-between items-center">
                        <label class="text-[9px] font-black text-slate-400 uppercase">Köşe Keskinliği</label>
                        <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{{ selectedBlock!.styles!.borderRadius }}px</span>
                    </div>
                    <input type="range" min="0" max="50" step="4" [(ngModel)]="selectedBlock!.styles!.borderRadius" (ngModelChange)="updateFullHtml()" class="w-full accent-violet-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer">
                </div>
            </section>

            <button (click)="selectedBlock = null" class="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all mt-6 active:scale-[0.98]">Ayarları Kapat</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 24px;
      box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.3);
      background: white;
      padding: 20px;
      opacity: 0.95;
      z-index: 2000;
      border: 2px solid #4f46e5;
    }

    .cdk-drag-placeholder {
      opacity: 0.15;
      background: #4f46e5;
      margin: 10px 0;
      border-radius: 24px;
      min-height: 80px;
      border: 2px dashed #4f46e5;
    }

    .cdk-drag-animating {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
  `]
})
export class MailBuilderComponent implements OnInit {
    @Output() htmlGenerated = new EventEmitter<string>();

    previewMode: 'desktop' | 'mobile' = 'desktop';

    componentGroups: any[] = [
        {
            title: 'Temel Bileşenler',
            blocks: [
                {
                    id: '', type: 'header', content: '',
                    config: { bgColor: '#ffffff', textColor: '#1e293b', logoUrl: '', socialLinks: [] },
                    styles: { align: 'center', paddingTop: 30, paddingBottom: 30, fontSize: 18, color: '#1e293b', bgColor: '#ffffff' }
                },
                {
                    id: '', type: 'text', content: 'Buraya şık bir metin ekleyin...',
                    config: {},
                    styles: { color: '#334155', align: 'left', fontSize: 16, paddingTop: 40, paddingBottom: 40, fontFamily: 'inherit', fontWeight: 'normal' }
                },
                {
                    id: '', type: 'image', content: '',
                    config: { url: '', socialLinks: [] },
                    styles: { align: 'center', borderRadius: 16, paddingTop: 20, paddingBottom: 40 }
                },
                {
                    id: '', type: 'button', content: 'Harekete Geç',
                    config: { url: '', socialLinks: [] },
                    styles: { bgColor: '#4f46e5', color: '#ffffff', align: 'center', borderRadius: 12, paddingTop: 20, paddingBottom: 40, fontSize: 15 }
                },
                {
                    id: '', type: 'divider', content: '',
                    config: { socialLinks: [] },
                    styles: { paddingTop: 20, paddingBottom: 40, color: '#e2e8f0' }
                },
                {
                    id: '', type: 'spacer', content: '',
                    config: { height: '30', socialLinks: [] },
                    styles: { paddingTop: 0, paddingBottom: 0 }
                }
            ]
        },
        {
            title: 'Gelişmiş',
            blocks: [
                {
                    id: '', type: 'social', content: '',
                    config: { socialLinks: [{ type: 'facebook', url: '#' }, { type: 'twitter', url: '#' }, { type: 'instagram', url: '#' }, { type: 'web', url: '#' }] },
                    styles: { align: 'center', paddingTop: 20, paddingBottom: 20 }
                },
                {
                    id: '', type: 'columns', content: '',
                    config: { columns: [[], []], socialLinks: [] },
                    styles: { paddingTop: 30, paddingBottom: 30 }
                },
                {
                    id: '', type: 'columns', content: '',
                    config: { columns: [[], [], []], socialLinks: [] },
                    styles: { paddingTop: 30, paddingBottom: 30 }
                }
            ]
        }
    ];

    canvasBlocks: MailBlock[] = [];
    selectedBlock: MailBlock | null = null;

    constructor(
        private generator: MailGeneratorService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        // Sayfa açıldığında kanvas boş gelecek (Kullanıcı isteği)

        // Listen for nested block addition from the rendered HTML
        window.addEventListener('addNestedBlock', (e: any) => {
            const { blockId, colIndex } = e.detail;
            this.addNestedBlock(blockId, colIndex);
        });
    }

    aiPrompt: string = '';
    isGenerating: boolean = false;

    // AI Sihirli Tasarım Oluşturucu (Simüle edilmiş güçlü AI)
    async generateAIDesign() {
        if (!this.aiPrompt.trim()) return;

        this.isGenerating = true;

        // AI işlem süresi simülasyonu
        await new Promise(r => setTimeout(r, 1500));

        const prompt = this.aiPrompt.toLowerCase();
        this.canvasBlocks = []; // Kanvası temizle

        // Akıllı blok eşleştirme mantığı
        if (prompt.includes('hoşgeldin') || prompt.includes('welcome')) {
            this.addBlock('header');
            this.canvasBlocks.push({
                id: Math.random().toString(36).substring(7),
                type: 'text',
                content: '<h1 style="margin:0">Aramıza Hoş Geldiniz! 🚀</h1><p>Sizi burada görmek harika. Yolculuğumuza birlikte başlamak için sabırsızlanıyoruz.</p>',
                styles: { fontSize: 18, align: 'center', color: '#1e293b', paddingTop: 20, paddingBottom: 20 }
            });
            this.addBlock('button');
            this.addBlock('social');
        } else if (prompt.includes('indirim') || prompt.includes('kampanya') || prompt.includes('sale')) {
            this.addBlock('header');
            this.canvasBlocks.push({
                id: Math.random().toString(36).substring(7),
                type: 'text',
                content: '<h2 style="color:#4f46e5; margin:0">%50 İNDİRİM FIRSATI!</h2><p>Hafta sonuna özel tüm ürünlerde büyük fırsat başladı.</p>',
                styles: { fontSize: 20, align: 'center', paddingTop: 40, paddingBottom: 20 }
            });
            this.addBlock('image');
            this.addBlock('button');
            this.addBlock('divider');
            this.addBlock('social');
        } else {
            // Genel taslak
            this.addBlock('header');
            this.canvasBlocks.push({
                id: Math.random().toString(36).substring(7),
                type: 'text',
                content: `<h2>${this.aiPrompt.toUpperCase()}</h2><p>İsteğiniz üzerine hazırlanan özel e-posta şablonu.</p>`,
                styles: { fontSize: 18, align: 'left', paddingTop: 30, paddingBottom: 30 }
            });
            this.addBlock('button');
            this.addBlock('social');
        }

        this.isGenerating = false;
        this.aiPrompt = '';
        this.updateFullHtml();
    }

    // AI ile Metin Yazma
    async askAIForText(block: MailBlock) {
        if (!block) return;

        const type = block.type;
        let response = '';

        if (type === 'text') {
            response = 'Harika bir haberimiz var! 🎉 Modern tasarımımız ve yenilikçi çözümlerimizle işinizi büyütmenize yardımcı oluyoruz. Hemen keşfetmeye başlayın.';
        } else if (type === 'button') {
            response = 'ŞİMDİ İNCELE';
        }

        if (response) {
            block.content = response;
            this.updateFullHtml();
        }
    }

    addNestedBlock(blockId: string, colIndex: number) {
        const block = this.canvasBlocks.find(b => b.id === blockId);
        if (block && block.type === 'columns' && block.config && block.config.columns) {
            const newBlock: MailBlock = {
                id: Math.random().toString(36).substring(7),
                type: 'text',
                content: 'Sütun içeriği...',
                styles: { fontSize: 13, color: '#64748b' },
                config: {}
            };
            block.config.columns[colIndex].push(newBlock);
            this.updateFullHtml();
        }
    }

    onDrop(event: CdkDragDrop<any>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            const block = event.item.data;
            const newBlock: MailBlock = {
                ...JSON.parse(JSON.stringify(block)),
                id: Math.random().toString(36).substring(7)
            };
            this.canvasBlocks.splice(event.currentIndex, 0, newBlock);
            this.selectedBlock = newBlock;
        }
        this.updateFullHtml();
    }

    addBlock(type: MailBlock['type']) {
        let template: MailBlock | undefined;
        for (const group of this.componentGroups) {
            template = group.blocks.find((b: any) => b.type === type) as any;
            if (template) break;
        }

        if (template) {
            const newBlock = {
                ...JSON.parse(JSON.stringify(template)),
                id: Math.random().toString(36).substring(7)
            };
            this.canvasBlocks.push(newBlock);
            this.selectBlock(newBlock);
        }
        this.updateFullHtml();
    }

    duplicateBlock(index: number) {
        const block = this.canvasBlocks[index];
        const newBlock = {
            ...JSON.parse(JSON.stringify(block)),
            id: Math.random().toString(36).substring(7)
        };
        this.canvasBlocks.splice(index + 1, 0, newBlock);
        this.selectedBlock = newBlock;
        this.updateFullHtml();
    }

    selectBlock(block: MailBlock) {
        this.selectedBlock = block;
    }

    removeBlock(index: number) {
        if (this.selectedBlock?.id === this.canvasBlocks[index].id) {
            this.selectedBlock = null;
        }
        this.canvasBlocks.splice(index, 1);
        this.updateFullHtml();
    }

    updateFullHtml() {
        const html = this.generator.generateHtml(this.canvasBlocks);
        this.htmlGenerated.emit(html);
    }

    renderBlockPreview(block: MailBlock): SafeHtml {
        const st = block.styles || {};
        const pt = st.paddingTop ?? 20;
        const pb = st.paddingBottom ?? 20;
        const pl = st.paddingLeft ?? 40;
        const pr = st.paddingRight ?? 40;
        const padding = (pt / 2) + 'px ' + (pr / 2) + 'px ' + (pb / 2) + 'px ' + (pl / 2) + 'px';

        let html = '';
        switch (block.type) {
            case 'header':
                html = `<div style="text-align:${st.align || 'center'}; padding: ${padding}; background:${block.config?.bgColor || '#ffffff'}; color:${block.config?.textColor || '#1e293b'}" class="font-black uppercase text-xs tracking-[0.2em]">${block.config?.logoUrl ? '<img src="' + block.config?.logoUrl + '" style="max-height:24px">' : 'LOGO'}</div>`;
                break;
            case 'text':
                html = `<div style="color:${st.color || '#334155'}; text-align:${st.align || 'left'}; font-size:${(st.fontSize || 16) - 2}px; padding: ${padding}; font-family: ${st.fontFamily || 'inherit'}" class="leading-relaxed font-medium">${block.content || '...'}</div>`;
                break;
            case 'button':
                html = `<div style="text-align:${st.align || 'center'}; padding: ${padding}"><span style="background:${st.bgColor || '#4f46e5'}; color:${st.color || '#ffffff'}; border-radius:${st.borderRadius || 12}px" class="px-6 py-3 font-black text-[10px] uppercase tracking-wider inline-block shadow-lg">${block.content || 'Buton'}</span></div>`;
                break;
            case 'image':
                html = `<div style="padding: ${padding}; text-align:${st.align || 'center'}"><img src="${block.config?.url || 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800'}" style="border-radius:${st.borderRadius || 16}px" class="w-full max-h-[300px] object-cover shadow-2xl"></div>`;
                break;
            case 'divider':
                html = `<div style="padding: ${padding}"><hr style="border:0; border-top: 1px solid ${st.color || '#e2e8f0'}"></div>`;
                break;
            case 'spacer':
                html = `<div style="height:${block.config?.height || '30'}px"></div>`;
                break;
            case 'social':
                const getPreviewIcon = (type: string) => {
                    const icons: any = {
                        facebook: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>',
                        twitter: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>',
                        instagram: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
                        web: '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>'
                    };
                    return icons[type] || icons.web;
                };

                html = `<div style="text-align:${st.align || 'center'}; padding: ${padding}" class="flex gap-2 justify-center">
                    ${(block.config?.socialLinks || []).map((link: any) => `
                        <div class="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
                            ${getPreviewIcon(link.type)}
                        </div>
                    `).join('')}
                </div>`;
                break;
            case 'columns':
                const cols = block.config?.columns || [];
                const colW = 100 / (cols.length || 1);
                html = `<div style="padding: ${padding}" class="flex gap-4">
                    ${cols.map((colBlocks: any, ci: number) => `
                        <div style="width: ${colW}%" class="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl min-h-[100px] p-2 flex flex-col gap-2 relative group/col">
                            ${colBlocks.map((b: any) => this.renderInternalPreview(b)).join('')}
                            <div class="flex-1 flex items-center justify-center opacity-0 group-hover/col:opacity-100 transition-opacity">
                                <button onclick="window.dispatchEvent(new CustomEvent('addNestedBlock', {detail: {blockId: '${block.id}', colIndex: ${ci}}})); event.stopPropagation();" class="p-1 bg-indigo-600 text-white rounded-lg pointer-events-auto">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
                break;
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    renderInternalPreview(block: MailBlock): string {
        const st = block.styles || {};
        switch (block.type) {
            case 'text': return `<div style="font-size:10px; color:${st.color}" class="line-clamp-2">${block.content}</div>`;
            case 'image': return `<div class="bg-slate-100 h-10 rounded-lg flex items-center justify-center text-[8px] font-bold text-slate-400">GÖRSEL</div>`;
            case 'button': return `<div style="background:${st.bgColor}; color:${st.color}" class="text-[8px] p-1 rounded text-center font-bold">BUTON</div>`;
            default: return `<div class="text-[8px] font-bold text-slate-300 uppercase">${block.type}</div>`;
        }
    }

    getBlockName(type: string): string {
        const names: any = {
            header: 'Header',
            text: 'Paragraf',
            button: 'CTA Buton',
            image: 'Görsel',
            divider: 'Ayırıcı',
            spacer: 'Boşluk',
            social: 'Sosyal Linkler',
            columns: 'Sütunlar'
        };
        return names[type] || type;
    }

    getBlockIcon(type: string): string {
        const icons: any = {
            header: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>',
            text: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>',
            button: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></svg>',
            image: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
            divider: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>',
            spacer: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
            social: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>',
            columns: '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2m0 10V7" /></svg>'
        };
        return icons[type] || '';
    }
}
