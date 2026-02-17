import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LandingComponent } from './pages/landing/landing.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LandingLayoutComponent } from './layouts/landing-layout/landing-layout.component';
import { authGuard } from './guards/auth.guard'; // Will create this

import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
    {
        path: '',
        component: LandingLayoutComponent,
        children: [
            { path: '', component: LandingComponent },
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'verify-email', component: VerifyEmailComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent }
        ]
    },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'mail-templates', loadComponent: () => import('./pages/mail-templates/mail-templates.component').then(m => m.MailTemplatesComponent), canActivate: [authGuard] },
            { path: 'mail-templates/new', loadComponent: () => import('./pages/mail-template-editor/mail-template-editor.component').then(m => m.MailTemplateEditorComponent), canActivate: [authGuard] },
            { path: 'mail-templates/edit/:id', loadComponent: () => import('./pages/mail-template-editor/mail-template-editor.component').then(m => m.MailTemplateEditorComponent), canActivate: [authGuard] },
            { path: 'smtp-accounts', loadComponent: () => import('./pages/smtp-accounts/smtp-accounts.component').then(m => m.SmtpAccountsComponent), canActivate: [authGuard] },
            { path: 'smtp-accounts/new', loadComponent: () => import('./pages/smtp-account-editor/smtp-account-editor.component').then(m => m.SmtpAccountEditorComponent), canActivate: [authGuard] },
            { path: 'smtp-accounts/edit/:id', loadComponent: () => import('./pages/smtp-account-editor/smtp-account-editor.component').then(m => m.SmtpAccountEditorComponent), canActivate: [authGuard] },
            { path: 'send-mail', loadComponent: () => import('./pages/send-mail/send-mail.component').then(m => m.SendMailComponent), canActivate: [authGuard] },
            { path: 'packages', loadComponent: () => import('./pages/packages/packages.component').then(m => m.PackagesComponent), canActivate: [authGuard] },
            { path: 'reports', loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent), canActivate: [authGuard] },
            { path: 'users', loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent), canActivate: [authGuard] },
            { path: 'contacts', loadComponent: () => import('./pages/contacts/contacts.component').then(m => m.ContactsComponent), canActivate: [authGuard] },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '' }
];
