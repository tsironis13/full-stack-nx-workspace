import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';

import { InputDirective } from './input.directive';

describe('InputDirective', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('keeps a native textbox role and disabled state', async () => {
    @Component({
      template: `<input libInput type="email" disabled aria-label="Email" />`,
      imports: [InputDirective],
    })
    class Host {}

    const fixture = await render(Host);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.type).toBe('email');
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-label')).toBe('Email');
  });

  it('writes through a reactive FormControl', async () => {
    @Component({
      template: `<input libInput [formControl]="control" aria-label="Name" />`,
      imports: [InputDirective, ReactiveFormsModule],
    })
    class Host {
      readonly control = new FormControl('Ada', { nonNullable: true });
    }

    const fixture = await render(Host);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Ada');

    input.value = 'Grace';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toBe('Grace');
  });

  it('writes through a signal form field', async () => {
    @Component({
      template: `<input libInput [formField]="login.email" aria-label="Email" />`,
      imports: [InputDirective, FormField],
    })
    class Host {
      private readonly model = signal({ email: 'ada@example.com' });
      readonly login = form(this.model);
    }

    const fixture = await render(Host);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('ada@example.com');

    input.value = 'grace@example.com';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.login.email().value()).toBe(
      'grace@example.com'
    );
  });
});
