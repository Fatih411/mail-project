import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MailTemplate {
  id: string;
  title: string;
  subject: string;
  htmlContent: string;
  ccList?: string;
  bccList?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MailTemplateService {
  private apiUrl = `${environment.apiUrl}/MailTemplates`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(template: Partial<MailTemplate>): Observable<any> {
    return this.http.post<any>(this.apiUrl, template);
  }

  update(template: MailTemplate): Observable<any> {
    return this.http.put<any>(this.apiUrl, template);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
