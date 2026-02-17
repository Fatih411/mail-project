import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-package-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border border-gray-100 shadow dark:border-gray-600 dark:bg-gray-800 dark:text-white">
        <h3 class="mb-4 text-2xl font-semibold">{{ package.name }}</h3>
        <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">İhtiyacınıza en uygun paket</p>
        <div class="flex justify-center items-baseline my-8">
            <span class="mr-2 text-5xl font-extrabold">{{ package.price }}₺</span>
            <span class="text-gray-500 dark:text-gray-400">/Aylık</span>
        </div>
        <!-- List -->
        <ul role="list" class="mb-8 space-y-4 text-left">
            <li class="flex items-center space-x-3">
                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                <span>Günlük <strong>{{ package.dailyMailLimit }}</strong> E-posta</span>
            </li>
            <li class="flex items-center space-x-3">
                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                <span><strong>{{ package.smtpAccountLimit }}</strong> SMTP Hesabı</span>
            </li>
             <li class="flex items-center space-x-3">
                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                <span><strong>{{ package.maxAttachmentSizeMB }} MB</strong> Ek Dosya Boyutu</span>
            </li>
             <li class="flex items-center space-x-3">
                <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                <span>7/24 Teknik Destek</span>
            </li>
        </ul>
        <a href="/register" class="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-indigo-900">Hemen Başlayın</a>
    </div>
  `
})
export class PackageCardComponent {
  @Input() package: any;
}
