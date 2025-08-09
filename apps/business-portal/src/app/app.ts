import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [NxWelcome, RouterModule, JsonPipe],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'business-portal';

  roles = signal<any>(null);
  http = inject(HttpClient);

  constructor() {
    this.http.get('/api/roles').subscribe((data) => {
      this.roles.set(data as any);
    });
  }
}
