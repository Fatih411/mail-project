import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-white rounded-lg shadow dark:bg-gray-900 m-4">
        <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2026 <a href="/" class="hover:underline">MailProject™</a>. All Rights Reserved.</span>
        </div>
    </footer>
  `
})
export class FooterComponent { }
