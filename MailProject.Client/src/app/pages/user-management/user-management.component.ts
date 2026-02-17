import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserDto } from '../../services/user.service';
import { PackageService } from '../../services/package.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="p-4 mt-14">
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Sistemdeki kullanıcıları görüntüleyin ve yönetin.</p>
            </div>
        </div>

        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">Ad Soyad</th>
                        <th scope="col" class="px-6 py-3">Email</th>
                        <th scope="col" class="px-6 py-3">Rol</th>
                        <th scope="col" class="px-6 py-3">Paket</th>
                        <th scope="col" class="px-6 py-3">Paket Bitiş</th>
                        <th scope="col" class="px-6 py-3">Onay Durumu</th>
                         <th scope="col" class="px-6 py-3">İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let user of users" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ user.fullName }}</td>
                        <td class="px-6 py-4">{{ user.email }}</td>
                        <td class="px-6 py-4">{{ user.role }}</td>
                        <td class="px-6 py-4">{{ user.packageName }}</td>
                        <td class="px-6 py-4">{{ user.packageEndDate | date:'dd.MM.yyyy' }}</td>
                        <td class="px-6 py-4">
                            <span [ngClass]="user.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'" class="px-2 py-1 rounded-full text-xs font-semibold">
                                {{ user.isVerified ? 'Onaylı' : 'Onaysız' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 space-x-3">
                            <button (click)="openPackageModal(user)" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Paket Değiştir</button>
                            <button (click)="deleteUser(user)" class="font-medium text-red-600 dark:text-red-500 hover:underline">Sil</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Package Change Modal -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="relative w-full max-w-md bg-white rounded-lg shadow dark:bg-gray-700">
            <div class="px-6 py-6 lg:px-8">
                <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Paket Değiştir</h3>
                <p class="text-sm text-gray-500 mb-4">{{ selectedUser?.fullName }} kullanıcısının paketini güncelleyin.</p>
                
                <div class="space-y-6">
                    <div>
                        <label for="packageSelect" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Yeni Paket</label>
                        <select id="packageSelect" [(ngModel)]="newPackageId" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white">
                            <option *ngFor="let pkg of packages" [value]="pkg.id">{{ pkg.name }} ({{pkg.price}} ₺)</option>
                        </select>
                    </div>
                    <div>
                        <label for="packageDate" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Paket Bitiş Tarihi</label>
                        <input type="date" id="packageDate" [(ngModel)]="newPackageEndDate" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white">
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-2">
                     <button (click)="closeModal()" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">İptal</button>
                    <button (click)="savePackageChange()" [disabled]="loading" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        {{ loading ? 'Kaydediliyor...' : 'Kaydet' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: UserDto[] = [];
  packages: any[] = [];

  showModal = false;
  selectedUser: UserDto | null = null;
  newPackageId: string = '';
  newPackageEndDate: string = '';
  loading = false;

  constructor(
    private userService: UserService,
    private packageService: PackageService,
    private toastr: ToastrService,
    private confirmService: ConfirmDialogService
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadPackages();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.users = res.data;
        } else {
          this.toastr.error('Kullanıcılar yüklenemedi.');
        }
      },
      error: () => this.toastr.error('Bir hata oluştu.')
    });
  }

  loadPackages() {
    this.packageService.getPackages().subscribe((res: any) => {
      if (res.isSuccess) {
        this.packages = res.data;
      }
    });
  }

  openPackageModal(user: UserDto) {
    this.selectedUser = user;
    this.newPackageId = '';

    // Default: 1 Month from now
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    this.newPackageEndDate = today.toISOString().split('T')[0];

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
    this.newPackageId = '';
    this.newPackageEndDate = '';
  }

  savePackageChange() {
    if (!this.selectedUser || !this.newPackageId || !this.newPackageEndDate) {
      this.toastr.warning('Lütfen paket ve bitiş tarihi seçin.');
      return;
    }

    this.loading = true;
    const endDate = new Date(this.newPackageEndDate).toISOString();

    this.userService.updateUserPackage(this.selectedUser.id, this.newPackageId, endDate).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.isSuccess) {
          this.toastr.success('Kullanıcı paketi güncellendi.');
          this.closeModal();
          this.loadUsers(); // Refresh list
        } else {
          this.toastr.error(res.message || 'Hata oluştu.');
        }
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Güncelleme sırasında hata oluştu.');
      }
    });
  }

  async deleteUser(user: UserDto) {
    const confirmed = await this.confirmService.confirm({
      title: 'Kullanıcıyı Sil',
      message: `${user.fullName} isimli kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sil',
      cancelText: 'Vazgeç',
      type: 'danger'
    });

    if (confirmed) {
      this.userService.deleteUser(user.id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success('Kullanıcı silindi.');
            this.loadUsers();
          } else {
            this.toastr.error(res.message || 'Kullanıcı silinemedi.');
          }
        },
        error: () => this.toastr.error('Silme işlemi sırasında bir hata oluştu.')
      });
    }
  }
}
