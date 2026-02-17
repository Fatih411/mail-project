import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonResponseMessage } from './mail.service';
import { environment } from '../../environments/environment';

export interface ReportFilter {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    searchTerm?: string;
    pageNumber: number;
    pageSize: number;
}

export interface ReportItem {
    id: string;
    date: Date;
    recipient: string;
    subject: string;
    status: string;
    errorMessage?: string;
    openedAt?: Date;
    clickedAt?: Date;
    isBounced: boolean;
    bounceReason?: string;
    index: number;
}

export interface ReportResult {
    items: ReportItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = `${environment.apiUrl}/reports`;

    constructor(private http: HttpClient) { }

    getReports(filter: ReportFilter): Observable<CommonResponseMessage<ReportResult>> {
        return this.http.post<CommonResponseMessage<ReportResult>>(`${this.apiUrl}/list`, filter);
    }
}
