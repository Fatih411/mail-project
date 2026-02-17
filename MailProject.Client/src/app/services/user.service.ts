import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  packageName: string;
  packageEndDate: string;
  isVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateUserPackage(userId: string, packageId: string, packageEndDate?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/package`, { packageId, packageEndDate });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`);
  }
}
