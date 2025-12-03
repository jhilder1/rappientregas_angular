import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-issue-page',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="page-container">
      <mat-card>
        <h2>Inconvenientes</h2>
        <p>Página de inconvenientes - En desarrollo</p>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      min-height: 100vh;
      background-color: #121212;
      padding-top: 80px;
    }
    mat-card {
      background-color: #1e1e1e;
      color: #fff;
    }
  `]
})
export class IssuePageComponent {}


