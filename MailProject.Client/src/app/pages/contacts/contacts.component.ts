import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact, ContactList } from '../../services/contact.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './contacts.component.html'
})
export class ContactsComponent implements OnInit {
    contacts: Contact[] = [];
    contactLists: ContactList[] = [];
    selectedListId: string = '';

    // UI States
    activeTab: 'all' | 'lists' = 'all';
    isImportModalOpen = false;
    isCreateListModalOpen = false;

    // Batch Add Form
    isBatchAddModalOpen = false;
    batchEmails: string = '';
    batchTargetListId: string = '';

    // Create List Form
    newList = { name: '', description: '' };

    // Import Form
    importFile: File | null = null;
    importTargetListId: string = '';

    // Edit Contact Form
    isEditContactModalOpen = false;
    selectedContact: any = null;

    constructor(
        private contactService: ContactService,
        private toastr: ToastrService,
        private confirmService: ConfirmDialogService
    ) { }

    ngOnInit(): void {
        this.loadContacts();
        this.loadLists();
    }

    loadContacts(): void {
        this.contactService.getContacts().subscribe({
            next: (res) => this.contacts = res.data,
            error: (err) => this.toastr.error('Kişiler yüklenirken hata oluştu.')
        });
    }

    loadLists(): void {
        this.contactService.getContactLists().subscribe({
            next: (res) => this.contactLists = res.data,
            error: (err) => this.toastr.error('Listeler yüklenirken hata oluştu.')
        });
    }

    onCreateList(): void {
        if (!this.newList.name) return;
        this.contactService.createList(this.newList.name, this.newList.description).subscribe({
            next: (res) => {
                this.toastr.success(res.message);
                this.loadLists();
                this.isCreateListModalOpen = false;
                this.newList = { name: '', description: '' };
            },
            error: (err) => this.toastr.error('Liste oluşturulamadı.')
        });
    }

    onFileChange(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.importFile = file;
        }
    }

    onImport(): void {
        if (!this.importFile) {
            this.toastr.warning('Lütfen bir dosya seçin.');
            return;
        }

        this.contactService.importContacts(this.importFile, this.importTargetListId).subscribe({
            next: (res) => {
                this.toastr.success(res.message);
                this.loadContacts();
                this.loadLists();
                this.isImportModalOpen = false;
                this.importFile = null;
            },
            error: (err) => this.toastr.error('Aktarım sırasında hata oluştu.')
        });
    }

    onBatchAdd(): void {
        if (!this.batchEmails.trim()) {
            this.toastr.warning('Lütfen e-posta adreslerini girin.');
            return;
        }

        this.contactService.batchAddContacts(this.batchEmails, this.batchTargetListId).subscribe({
            next: (res) => {
                this.toastr.success(res.message);
                this.loadContacts();
                this.loadLists();
                this.isBatchAddModalOpen = false;
                this.batchEmails = '';
            },
            error: (err) => this.toastr.error('Kişiler eklenirken hata oluştu.')
        });
    }

    deleteList(id: string): void {
        this.confirmService.confirm({
            title: 'Listeyi Sil',
            message: 'Bu listeyi silmek istediğinize emin misiniz? Liste üyeleri rehberden silinmez, sadece bu liste ile ilişkileri kaldırılır.',
            confirmText: 'LİSTEYİ SİL',
            cancelText: 'VAZGEÇ',
            type: 'danger'
        }).then(confirmed => {
            if (confirmed) {
                this.contactService.deleteList(id, true).subscribe({
                    next: (res) => {
                        this.toastr.success(res.message);
                        this.loadLists();
                    },
                    error: (err) => this.toastr.error('Liste silinemedi.')
                });
            }
        });
    }

    getContactsForList(listId: string): Contact[] {
        const list = this.contactLists.find(l => l.id === listId);
        return list?.contacts || [];
    }

    deleteContact(id: string): void {
        this.confirmService.confirm({
            title: 'Kişiyi Sil',
            message: 'Bu kişiyi rehberden tamamen silmek istediğinize emin misiniz?',
            confirmText: 'SİL',
            cancelText: 'VAZGEÇ',
            type: 'danger'
        }).then(confirmed => {
            if (confirmed) {
                this.contactService.deleteContact(id).subscribe({
                    next: (res) => {
                        this.toastr.success(res.message);
                        this.loadContacts();
                        this.loadLists();
                    },
                    error: (err) => this.toastr.error('Kişi silinemedi.')
                });
            }
        });
    }

    openEditModal(contact: Contact): void {
        this.selectedContact = { ...contact };
        this.isEditContactModalOpen = true;
    }

    onUpdateContact(): void {
        if (!this.selectedContact) return;
        this.contactService.updateContact(this.selectedContact).subscribe({
            next: (res) => {
                this.toastr.success(res.message);
                this.loadContacts();
                this.loadLists();
                this.isEditContactModalOpen = false;
                this.selectedContact = null;
            },
            error: (err) => this.toastr.error('Kişi güncellenemedi.')
        });
    }
}
