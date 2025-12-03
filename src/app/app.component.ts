import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { provideAnimations } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="app">
      <app-navbar></app-navbar>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
      background-attachment: fixed;
      position: relative;
    }
    
    .app::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }
    
    router-outlet + * {
      position: relative;
      z-index: 1;
    }
  `]
})
export class AppComponent {
  title = 'flash-food-angular';
}

