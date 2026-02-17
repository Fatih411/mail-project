import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  constructor(private dataService: DataService) { }

  getPackages(): Observable<any> {
    return this.dataService.get('packages/active');
  }

  getPackageById(id: string): Observable<any> {
    return this.dataService.get(`packages/${id}`);
  }
}
