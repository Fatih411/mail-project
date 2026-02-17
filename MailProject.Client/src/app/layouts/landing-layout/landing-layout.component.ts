import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
    selector: 'app-landing-layout',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, FooterComponent],
    template: `
    <div class="flex flex-col min-h-screen">
      <app-navbar [isAuth]="false"></app-navbar>
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `
})
export class LandingLayoutComponent { }
