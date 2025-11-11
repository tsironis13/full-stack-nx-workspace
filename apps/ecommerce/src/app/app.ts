import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { HeaderComponent } from '../layout/header/header.component';

@Component({
  imports: [RouterModule, HeaderComponent, ButtonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'ecommerce';
}
