import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="h-screen bg-gray-100 dark:bg-gray-900">
      <div class="h-full flex flex-col overflow-hidden sm:ml-64">
        <main class="flex-1 overflow-x-auto overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6 pt-16">
          <router-outlet></router-outlet>
        </main>
      </div>
      
      <app-sidebar [isOpen]="isSidebarOpen"></app-sidebar>
      
      <!-- Mobile Backdrop -->
      <div *ngIf="isSidebarOpen" (click)="closeSidebar()" class="fixed inset-0 z-30 bg-gray-900/50 dark:bg-gray-900/80 sm:hidden"></div>

      <app-navbar [isAuth]="true" (onToggleSidebar)="toggleSidebar()"></app-navbar>
    </div>
  `
})
export class AdminLayoutComponent {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
