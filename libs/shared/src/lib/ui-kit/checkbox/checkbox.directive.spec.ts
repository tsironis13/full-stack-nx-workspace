import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';

import { CheckboxDirective } from './checkbox.directive';

describe('CheckboxDirective', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('keeps a native checkbox role and disabled state', async () => {
    @Component({
      template: `<input libCheckbox type="checkbox" disabled aria-label="Subscribe" />`,
      imports: [CheckboxDirective],
    })
    class Host {}

    const fixture = await render(Host);
    const checkbox = fixture.nativeElement.querySelector(
      'input'
    ) as HTMLInputElement;

    expect(checkbox.type).toBe('checkbox');
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.classList.contains('accent-primary')).toBe(true);
    expect(checkbox.classList.contains('border-border')).toBe(true);
    expect(checkbox.getAttribute('aria-label')).toBe('Subscribe');
  });

  it('writes through a reactive FormControl', async () => {
    @Component({
      template: `<input libCheckbox type="checkbox" [formControl]="control" aria-label="Subscribe" />`,
      imports: [CheckboxDirective, ReactiveFormsModule],
    })
    class Host {
      readonly control = new FormControl(false, { nonNullable: true });
    }

    const fixture = await render(Host);
    const checkbox = fixture.nativeElement.querySelector(
      'input'
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    checkbox.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it('writes through a signal form field', async () => {
    @Component({
      template: `<input libCheckbox type="checkbox" [formField]="prefs.subscribe" aria-label="Subscribe" />`,
      imports: [CheckboxDirective, FormField],
    })
    class Host {
      private readonly model = signal({ subscribe: false });
      readonly prefs = form(this.model);
    }

    const fixture = await render(Host);
    const checkbox = fixture.nativeElement.querySelector(
      'input'
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    checkbox.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.prefs.subscribe().value()).toBe(true);
  });
});
