import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { InputDirective } from '../input/input.directive';
import { FieldComponent } from './field.component';

describe('FieldComponent', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('associates a stacked label with the projected control', async () => {
    @Component({
      template: `
        <lib-field label="Email" controlId="email">
          <input libInput type="email" />
        </lib-field>
      `,
      imports: [FieldComponent, InputDirective],
    })
    class Host {}

    const fixture = await render(Host);
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(label.textContent?.trim()).toBe('Email');
    expect(label.htmlFor).toBe('email');
    expect(input.id).toBe('email');
  });

  it('associates an error with the control for assistive tech', async () => {
    @Component({
      template: `
        <lib-field label="Email" controlId="email" error="Email is required">
          <input libInput type="email" />
        </lib-field>
      `,
      imports: [FieldComponent, InputDirective],
    })
    class Host {}

    const fixture = await render(Host);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;

    expect(alert.textContent?.trim()).toBe('Email is required');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('associates a hint when there is no error and ships no default copy', async () => {
    @Component({
      template: `
        <lib-field label="Phone" controlId="phone" hint="Include country code">
          <input libInput type="tel" />
        </lib-field>
      `,
      imports: [FieldComponent, InputDirective],
    })
    class Host {}

    const fixture = await render(Host);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const hint = fixture.nativeElement.querySelector('#phone-hint') as HTMLElement;

    expect(hint.textContent?.trim()).toBe('Include country code');
    expect(input.getAttribute('aria-describedby')).toBe('phone-hint');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
