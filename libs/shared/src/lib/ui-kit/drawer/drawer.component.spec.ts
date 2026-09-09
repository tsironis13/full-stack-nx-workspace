import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { DrawerComponent } from './drawer.component';

describe('DrawerComponent', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('binds open two-way to a native dialog and moves focus inside', async () => {
    @Component({
      template: `
        <button type="button" id="opener">Open cart</button>
        <lib-drawer [(open)]="open">
          <button type="button">Inside</button>
        </lib-drawer>
      `,
      imports: [DrawerComponent],
    })
    class Host {
      readonly open = signal(false);
    }

    const fixture = await render(Host);
    const opener = fixture.nativeElement.querySelector(
      '#opener',
    ) as HTMLButtonElement;
    opener.focus();
    expect(document.activeElement).toBe(opener);

    fixture.componentInstance.open.set(true);
    await fixture.whenStable();

    const dialog = fixture.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and writes open back to false', async () => {
    @Component({
      template: `
        <lib-drawer [(open)]="open">
          <button type="button">Inside</button>
        </lib-drawer>
      `,
      imports: [DrawerComponent],
    })
    class Host {
      readonly open = signal(true);
    }

    const fixture = await render(Host);
    const dialog = fixture.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement;
    expect(dialog.open).toBe(true);

    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();

    expect(fixture.componentInstance.open()).toBe(false);
    expect(dialog.open).toBe(false);
  });
});
