import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ChatMessagesComponent } from './chat-messages.component';

vi.mock('@copilotkit/angular', () => import('../copilot-angular.stubs'));
vi.mock('../../util-copilotkit/activity/copilot-activity', () =>
  import('../copilot-angular.stubs'),
);

describe('ChatMessagesComponent UI Theme', () => {
  it('renders bubbles and interrupt chips on semantic tokens without kit buttons', async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessagesComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ChatMessagesComponent);
    fixture.componentRef.setInput('agentId', 'shopping-agent');
    fixture.componentRef.setInput('greeting', 'Hi! How can I help you?');
    fixture.componentRef.setInput('messages', [
      { id: 'u1', role: 'user', content: 'waterproof coat' },
    ]);
    fixture.componentRef.setInput('pendingInterrupts', [
      {
        id: 'int-1',
        message: 'Add this Product?',
        metadata: {
          suspendPayload: {
            message: 'Add Αδιάβροχο παλτό?',
            options: [{ id: 'yes', label: 'Add', payload: { approved: true } }],
          },
        },
      },
    ]);
    await fixture.whenStable();

    const html = fixture.nativeElement.innerHTML as string;
    const chip = fixture.nativeElement.querySelector(
      '.interrupt-actions button',
    ) as HTMLButtonElement;
    const userBubble = fixture.nativeElement.querySelector(
      '.bubble.rounded-br-md',
    ) as HTMLElement;

    expect(fixture.nativeElement.textContent).toContain('waterproof coat');
    expect(fixture.nativeElement.textContent).toContain('Add Αδιάβροχο παλτό?');
    expect(chip).toBeTruthy();
    expect(chip.hasAttribute('libButton')).toBe(false);
    expect(chip.className).toContain('border-primary');
    expect(chip.className).toContain('text-primary');
    expect(userBubble.className).toContain('bg-primary');
    expect(userBubble.className).toContain('text-primary-foreground');
    expect(html).not.toMatch(/\bgray-/);
    expect(html).not.toMatch(/--p-/);
    expect(html).not.toMatch(/#4f46e5|#111827|#e5e7eb/);
  });
});
