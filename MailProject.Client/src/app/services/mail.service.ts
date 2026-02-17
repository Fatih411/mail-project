import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface CommonResponseMessage<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

export interface SendMailRequest {
  smtpAccountId: string;
  mailTemplateId: string;
  recipients: string[];
  contactListId?: string;
  sendToAll?: boolean;
  scheduledTime?: string; // Optional scheduler
}

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private apiUrl = `${environment.apiUrl}/mail`;

  constructor(private http: HttpClient) { }

  sendMailBatch(request: SendMailRequest): Observable<CommonResponseMessage<string>> {
    return this.http.post<CommonResponseMessage<string>>(`${this.apiUrl}/send`, request);
  }

  // Will add getLogs later when implementing report page
}
