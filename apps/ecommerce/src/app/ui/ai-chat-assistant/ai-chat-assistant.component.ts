import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { CopilotChat, provideCopilotChatLabels } from '@copilotkit/angular';

@Component({
  selector: 'app-ai-chat-assistant',
  templateUrl: './ai-chat-assistant.component.html',
  styleUrl: './ai-chat-assistant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CopilotChat],
  providers: [
    provideCopilotChatLabels({
      welcomeMessageText:
        'Πες μου τι χρειάζεσαι, για παράδειγμα αδιάβροχα παπούτσια για πεζοπορία.',
      chatInputPlaceholder: 'Περίγραψε τι ψάχνεις…',
      chatDisclaimerText:
        'Ο βοηθός προτείνει προϊόντα. Έλεγξε τις λεπτομέρειες στη σελίδα προϊόντος.',
    }),
  ],
  host: {
    class: 'contents',
  },
})
export class AiChatAssistantComponent {
  private readonly injector = inject(Injector);

  protected readonly agentId = 'shoppingAgent';
  protected readonly open = signal(false);

  private readonly launcher =
    viewChild<ElementRef<HTMLButtonElement>>('launcher');
  private readonly closeButton =
    viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  protected toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }

    this.open.set(true);
    afterNextRender(
      () => this.closeButton()?.nativeElement.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }

    this.open.set(false);
    afterNextRender(
      () => this.launcher()?.nativeElement.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }
}
