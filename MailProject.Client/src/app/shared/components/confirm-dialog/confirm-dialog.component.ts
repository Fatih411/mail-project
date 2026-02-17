import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, ConfirmOptions } from '../../services/confirm-dialog.service';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in text-left">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-in">
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div [ngClass]="{
              'bg-red-100 text-red-600': options?.type === 'danger',
              'bg-yellow-100 text-yellow-600': options?.type === 'warning',
              'bg-blue-100 text-blue-600': options?.type === 'info' || !options?.type
            }" class="p-3 rounded-full">
              <svg *ngIf="options?.type === 'danger'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg *ngIf="options?.type !== 'danger'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ options?.title }}</h3>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            {{ options?.message }}
          </p>

          <div class="flex justify-end gap-3">
            <button (click)="handle(false)" 
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition">
              {{ options?.cancelText || 'Vazgeç' }}
            </button>
            <button (click)="handle(true)" 
                    [ngClass]="{
                      'bg-red-600 hover:bg-red-700': options?.type === 'danger',
                      'bg-blue-600 hover:bg-blue-700': options?.type !== 'danger'
                    }"
                    class="px-4 py-2 text-sm font-medium text-white rounded-lg transition">
              {{ options?.confirmText || 'Evet, Devam Et' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .scale-in { animation: scaleIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class ConfirmDialogComponent implements OnInit {
    isOpen = false;
    options: ConfirmOptions | null = null;
    private currentResolve: ((result: boolean) => void) | null = null;

    constructor(private confirmService: ConfirmDialogService) { }

    ngOnInit() {
        this.confirmService.confirm$.subscribe(data => {
            this.options = data.options;
            this.currentResolve = data.resolve;
            this.isOpen = true;
        });
    }

    handle(result: boolean) {
        this.isOpen = false;
        if (this.currentResolve) {
            this.currentResolve(result);
            this.currentResolve = null;
        }
    }
}
