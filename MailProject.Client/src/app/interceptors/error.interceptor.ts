import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastr = inject(ToastrService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Bir hata oluştu!';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = `Hata: ${error.error.message}`;
            } else {
                // Server-side error
                if (error.status === 401) {
                    errorMessage = 'Yetkisiz işlem! Lütfen giriş yapın.';
                } else if (error.status === 403) {
                    errorMessage = 'Bu işlem için yetkiniz yok veya e-posta doğrulanmamış.';
                } else if (error.status === 400) {
                    errorMessage = error.error?.message || 'Geçersiz istek.';
                    if (error.error?.errors) {
                        // Show validation errors if any
                        const validationErrors = Object.values(error.error.errors).flat().join(', ');
                        if (validationErrors) errorMessage = validationErrors;
                    }
                } else if (error.status === 404) {
                    errorMessage = 'Kaynak bulunamadı.';
                } else if (error.status === 500) {
                    errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
                }
            }

            // Show toastr error only if it's not a 403 (handled by login component for redirect) logic?
            // actually user asked for global handling so let's show it. 
            // EXCEPT maybe 403 on login page which redirects? 
            // Toastr won't hurt.

            toastr.error(errorMessage, 'Hata');
            return throwError(() => error);
        })
    );
};
