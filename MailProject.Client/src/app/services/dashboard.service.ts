import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConstants } from '../core/constants/app.constants';
import { CommonResponseMessage } from '../services/mail.service';
import { environment } from '../../environments/environment';

export interface DashboardStats {
    totalMails: number;
    activeTemplates: number;
    smtpAccounts: number;
    remainingDailyLimit: number;
    totalDailyLimit: number;
    successfulEmails: number;
    failedEmails: number;
    packageName: string;
    packageEndDate: string;
    recentActivity: any[];

    // Admin
    totalUsers?: number;
    systemTotalEmails?: number;
    systemTotalFailed?: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getStats(): Observable<CommonResponseMessage<DashboardStats>> {
        return this.http.get<CommonResponseMessage<DashboardStats>>(`${this.apiUrl}/stats`);
    }
}
