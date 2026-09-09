import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ButtonDirective } from './button.directive';

describe('ButtonDirective', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('keeps native type and disabled on a button host', async () => {
    @Component({
      template: `<button libButton type="submit" disabled>Save</button>`,
      imports: [ButtonDirective],
    })
    class Host {}

    const fixture = await render(Host);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.type).toBe('submit');
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Save');
  });

  it('works on a native link and projects icon markup', async () => {
    @Component({
      template: `
        <a libButton href="/catalog">
          <i class="pi pi-shopping-cart" aria-hidden="true"></i>
          Catalog
        </a>
      `,
      imports: [ButtonDirective],
    })
    class Host {}

    const fixture = await render(Host);
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/catalog');
    expect(link.textContent).toContain('Catalog');
    expect(link.querySelector('.pi-shopping-cart')).not.toBeNull();
  });

  it('marks the control busy when loading and does not emit click', async () => {
    const clicked = vi.fn();

    @Component({
      template: `<button libButton type="button" [loading]="loading()" (click)="onClick()">Pay</button>`,
      imports: [ButtonDirective],
    })
    class Host {
      readonly loading = signal(true);
      onClick = clicked;
    }

    const fixture = await render(Host);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(true);

    button.click();
    await fixture.whenStable();
    expect(clicked).not.toHaveBeenCalled();
  });

  it('restores a previously enabled button when loading ends', async () => {
    @Component({
      template: `<button libButton type="button" [loading]="loading()">Pay</button>`,
      imports: [ButtonDirective],
    })
    class Host {
      readonly loading = signal(true);
    }

    const fixture = await render(Host);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    fixture.componentInstance.loading.set(false);
    await fixture.whenStable();
    expect(button.disabled).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });

  it('does not enable a natively disabled button when loading ends', async () => {
    @Component({
      template: `<button libButton type="button" disabled [loading]="loading()">Pay</button>`,
      imports: [ButtonDirective],
    })
    class Host {
      readonly loading = signal(true);
    }

    const fixture = await render(Host);
    fixture.componentInstance.loading.set(false);
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('sets aria-disabled on an anchor while loading and blocks navigation', async () => {
    const clicked = vi.fn();

    @Component({
      template: `<a libButton href="/pay" [loading]="true" (click)="onClick()">Pay</a>`,
      imports: [ButtonDirective],
    })
    class Host {
      onClick = clicked;
    }

    const fixture = await render(Host);
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.hasAttribute('disabled')).toBe(false);

    link.click();
    await fixture.whenStable();
    expect(clicked).not.toHaveBeenCalled();
  });
});
