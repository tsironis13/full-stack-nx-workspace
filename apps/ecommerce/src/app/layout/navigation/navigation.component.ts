import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';
import { AssistantChatComponent } from '@full-stack-nx-workspace/shared';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    HeaderComponent,
    CartDrawerComponent,
    AssistantChatComponent,
  ],
})
export class NavigationComponent {
  protected readonly cartDrawerVisible = signal(false);
}
