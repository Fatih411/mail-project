import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SmtpAccount {
  id: string;
  accountName: string;
  host: string;
  port: number;
  username: string;
  password?: string; // Optional when reading, required when creating/updating if changed
  enableSsl: boolean;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SmtpAccountService {
  private apiUrl = `${environment.apiUrl}/SmtpAccounts`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(account: Partial<SmtpAccount>): Observable<any> {
    return this.http.post<any>(this.apiUrl, account);
  }

  update(account: SmtpAccount): Observable<any> {
    return this.http.put<any>(this.apiUrl, account);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
