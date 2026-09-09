import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { InlineMessageComponent } from './inline-message.component';

describe('InlineMessageComponent', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('projects its body as an alert when variant is error', async () => {
    @Component({
      template: `<lib-inline-message variant="error"
        >Place order failed</lib-inline-message
      >`,
      imports: [InlineMessageComponent],
    })
    class Host {}

    const fixture = await render(Host);
    const message = fixture.nativeElement.querySelector(
      '[role="alert"]',
    ) as HTMLElement;

    expect(message.textContent?.trim()).toBe('Place order failed');
  });

  it('projects its body as status for warning and info', async () => {
    @Component({
      template: `
        <lib-inline-message variant="warning">Low stock</lib-inline-message>
        <lib-inline-message variant="info">Ships tomorrow</lib-inline-message>
      `,
      imports: [InlineMessageComponent],
    })
    class Host {}

    const fixture = await render(Host);
    const statuses = fixture.nativeElement.querySelectorAll(
      '[role="status"]',
    ) as NodeListOf<HTMLElement>;

    expect(statuses).toHaveLength(2);
    expect(statuses[0]?.textContent?.trim()).toBe('Low stock');
    expect(statuses[1]?.textContent?.trim()).toBe('Ships tomorrow');
  });
});
