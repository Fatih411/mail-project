import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isUnsubscribed: boolean;
    unsubscribedAt?: string;
    createdAt: string;
}

export interface ContactList {
    id: string;
    name: string;
    description?: string;
    contacts?: Contact[];
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    private apiUrl = `${environment.apiUrl}/contacts`;

    constructor(private http: HttpClient) { }

    getContacts(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    getContactLists(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/lists`);
    }

    createList(name: string, description?: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/lists`, { name, description });
    }

    deleteList(id: string, keepContacts: boolean = true): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/lists/${id}?keepContacts=${keepContacts}`);
    }

    batchAddContacts(rawEmails: string, listId?: string): Observable<any> {
        const payload = { rawEmails, listId: listId || null };
        return this.http.post<any>(`${this.apiUrl}/batch-add`, payload);
    }

    importContacts(file: File, listId?: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        let url = `${this.apiUrl}/import`;
        if (listId) url += `?listId=${listId}`;
        return this.http.post<any>(url, formData);
    }

    addContactToList(listId: string, email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/lists/${listId}/add-contact`, { email });
    }

    deleteContact(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    updateContact(contact: any): Observable<any> {
        return this.http.put<any>(this.apiUrl, contact);
    }
}
