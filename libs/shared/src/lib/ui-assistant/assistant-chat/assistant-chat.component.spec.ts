import { Component, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopilotKit } from '@copilotkit/angular';
import { describe, expect, it, vi } from 'vitest';

import { AgentModeService } from '../../util-common/agent-mode-service';
import { ChatMessagesComponent } from '../chat-messages/chat-messages.component';
import { ChatRegistry } from '../chat-registry';
import { AssistantChatComponent } from './assistant-chat.component';

vi.mock('@copilotkit/angular', () => import('../copilot-angular.stubs'));
vi.mock('../../util-copilotkit/activity/copilot-activity', () =>
  import('../copilot-angular.stubs'),
);
vi.mock('../../util-copilotkit/agent-store-helper', () => ({
  getAgentMessages: () => [],
  sendMessage: async () => undefined,
  stop: () => undefined,
}));

@Component({
  selector: 'app-chat-messages',
  template: '',
})
class ChatMessagesStub {
  readonly messages = input<unknown[]>([]);
  readonly agentId = input('');
  readonly greeting = input('');
  readonly pending = input(false);
  readonly pendingInterrupts = input<unknown[]>([]);
  readonly resumeInterrupt = output<unknown>();
}

describe('AssistantChatComponent UI Theme', () => {
  async function render(): Promise<ComponentFixture<AssistantChatComponent>> {
    const registry = new ChatRegistry();
    const messages = signal([]);
    const isRunning = signal(false);

    TestBed.overrideComponent(AssistantChatComponent, {
      remove: { imports: [ChatMessagesComponent] },
      add: { imports: [ChatMessagesStub] },
    });

    await TestBed.configureTestingModule({
      imports: [AssistantChatComponent],
      providers: [
        AgentModeService,
        { provide: ChatRegistry, useValue: registry },
        { provide: CopilotKit, useValue: {} },
      ],
    }).compileComponents();

    registry.setChat({
      store: signal({
        messages,
        isRunning,
        agent: { agentId: 'shopping-agent' },
      }) as never,
      interrupts: {
        interrupts: signal([]),
        resolve: async () => undefined,
      } as never,
      showModeSelector: true,
    });

    const fixture = TestBed.createComponent(AssistantChatComponent);
    fixture.componentRef.setInput('position', 'right');
    await fixture.whenStable();
    return fixture;
  }

  function expectOwnedChrome(html: string): void {
    expect(html).not.toMatch(/\bgray-/);
    expect(html).not.toMatch(/--p-/);
    expect(html).not.toMatch(/#4f46e5|#2563eb|#111827|#e5e7eb|#030712/);
  }

  it('keeps launcher, panel, and send as custom markup on semantic tokens', async () => {
    const fixture = await render();
    const root = fixture.nativeElement as HTMLElement;

    const launcher = root.querySelector('#ai-toggle') as HTMLButtonElement;
    const panel = root.querySelector('#ai-panel') as HTMLElement;
    const send = root.querySelector(
      '#ai-composer button[type="submit"]',
    ) as HTMLButtonElement;
    const close = root.querySelector('#ai-close') as HTMLButtonElement;
    const mode = root.querySelector(
      'select[aria-label="Agent mode"]',
    ) as HTMLSelectElement;

    expect(launcher).toBeTruthy();
    expect(launcher.hasAttribute('libButton')).toBe(false);
    expect(launcher.classList.contains('text-primary-outline')).toBe(true);
    expect(launcher.classList.contains('text-primary')).toBe(false);
    expect(launcher.className).toContain('border-border');
    expect(launcher.className).toContain('bg-surface/90');

    expect(panel.className).toContain('bg-surface');
    expect(panel.className).toContain('border-border');

    const headerIcon = panel.querySelector(
      'header [aria-hidden="true"]',
    ) as HTMLElement;
    expect(headerIcon.classList.contains('text-primary-outline')).toBe(true);
    expect(headerIcon.classList.contains('text-primary')).toBe(false);

    expect(send).toBeTruthy();
    expect(send.hasAttribute('libButton')).toBe(false);
    expect(send.className).toContain('bg-primary');
    expect(send.className).toContain('text-primary-foreground');
    expect(send.className).toContain('hover:bg-primary-hover');

    expect(close.hasAttribute('libButton')).toBe(false);
    expect(close.className).toContain('hover:bg-surface-hover');
    expect(mode.hasAttribute('libSelect')).toBe(false);

    expectOwnedChrome(root.innerHTML);
  });
});
