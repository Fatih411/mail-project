import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppConstants } from '../../core/constants/app.constants';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed w-full top-0 left-0 z-50">
      <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <div class="flex items-center justify-start">
            <!-- Hamburger Menu (Mobile Only) -->
            <button *ngIf="isAuth" (click)="toggleSidebar()" type="button" class="inline-flex items-center p-2 mr-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                <span class="sr-only">Menüyü Aç</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
            </button>

            <a routerLink="/" class="flex items-center">
                <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">{{ appName }}</span>
            </a>
        </div>

        <div class="flex items-center lg:order-2">
            <!-- Non-Authenticated Links -->
            <ng-container *ngIf="!isAuth">
                <a routerLink="/login" class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">Giriş Yap</a>
                <a routerLink="/register" class="text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 mr-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800">Kayıt Ol</a>
            </ng-container>

            <!-- Authenticated User Menu -->
            <ng-container *ngIf="isAuth">
                 <!-- Notification Icon (Placeholder) -->
                 <button type="button" class="hidden sm:block p-2 mr-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
                    <span class="sr-only">Bildirimleri Gör</span>
                    <!-- Bell Icon -->
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                 </button>

                 <!-- User Dropdown (Simplified) -->
                 <div class="relative ml-3">
                    <div class="flex items-center gap-2 cursor-pointer" (click)="toggleUserMenu()">
                        <span class="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">{{ currentUser?.name }}</span>
                        <div class="relative inline-flex items-center justify-center w-8 h-8 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                            <span class="font-medium text-gray-600 dark:text-gray-300">{{ userInitials }}</span>
                        </div>
                    </div>
                    <!-- Dropdown menu -->
                    <div *ngIf="showUserMenu" class="absolute right-0 z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600">
                        <div class="px-4 py-3" role="none">
                          <p class="text-sm text-gray-900 dark:text-white" role="none">Hesabım</p>
                          <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">{{ currentUser?.email }}</p>
                        </div>
                        <ul class="py-1" role="none">
                          <li>
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Ayarlar</a>
                          </li>
                          <li>
                            <a (click)="logout()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer" role="menuitem">Çıkış Yap</a>
                          </li>
                        </ul>
                    </div>
                 </div>
            </ng-container>
            
             <!-- Dark Mode Toggler -->
            <button (click)="toggleDarkMode()" class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 ml-2">
                <svg *ngIf="isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                <svg *ngIf="!isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            </button>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  @Input() isAuth = false;
  @Output() onToggleSidebar = new EventEmitter<void>();

  showUserMenu = false;
  isDark = false;

  currentUser: any = null;
  userInitials: string = '';
  appName = AppConstants.appName;

  constructor(private authService: AuthService) {
    // Check local storage for theme
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDark = true;
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.name) {
        this.userInitials = user.name.substring(0, 2).toUpperCase();
      } else {
        this.userInitials = '';
      }
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleSidebar() {
    this.onToggleSidebar.emit();
  }

  toggleDarkMode() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('color-theme', 'light');
    }
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
  }
}
