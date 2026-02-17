import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmDialogComponent],
  template: `
    <router-outlet />
    <app-confirm-dialog />
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MailProject.Client';
}
