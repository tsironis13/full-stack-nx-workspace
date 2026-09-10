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
      {
        id: 'a1',
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: 'tc1',
            type: 'function',
            function: { name: 'search_products_by_need', arguments: '{}' },
          },
        ],
      },
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
    const toolBubble = fixture.nativeElement.querySelector(
      '.bubble.border-border',
    ) as HTMLElement;
    const avatar = fixture.nativeElement.querySelector(
      '[aria-hidden="true"]',
    ) as HTMLElement;

    expect(fixture.nativeElement.textContent).toContain('waterproof coat');
    expect(fixture.nativeElement.textContent).toContain('Add Αδιάβροχο παλτό?');
    expect(chip).toBeTruthy();
    expect(chip.hasAttribute('libButton')).toBe(false);
    expect(chip.classList.contains('border-primary-outline')).toBe(true);
    expect(chip.classList.contains('text-primary-outline')).toBe(true);
    expect(chip.classList.contains('text-primary')).toBe(false);
    expect(avatar.classList.contains('text-primary-outline')).toBe(true);
    expect(avatar.classList.contains('text-primary')).toBe(false);
    expect(userBubble.className).toContain('bg-primary');
    expect(userBubble.className).toContain('text-primary-foreground');
    expect(toolBubble).toBeTruthy();
    expect(toolBubble.className).toContain('text-foreground');
    expect(html).not.toMatch(/\bgray-/);
    expect(html).not.toMatch(/--p-/);
    expect(html).not.toMatch(/#4f46e5|#111827|#e5e7eb/);
  });
});
