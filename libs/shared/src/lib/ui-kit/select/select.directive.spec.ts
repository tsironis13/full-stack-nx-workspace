import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { describe, expect, it } from 'vitest';

import { SelectDirective } from './select.directive';

describe('SelectDirective', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('keeps native disabled on a combobox', async () => {
    @Component({
      template: `
        <select libSelect disabled aria-label="Sort">
          <option value="name">Name</option>
        </select>
      `,
      imports: [SelectDirective],
    })
    class Host {}

    const fixture = await render(Host);
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    expect(select.disabled).toBe(true);
    expect(select.getAttribute('aria-label')).toBe('Sort');
  });

  it('writes through a reactive FormControl', async () => {
    @Component({
      template: `
        <select libSelect [formControl]="control" aria-label="Sort">
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      `,
      imports: [SelectDirective, ReactiveFormsModule],
    })
    class Host {
      readonly control = new FormControl('name', { nonNullable: true });
    }

    const fixture = await render(Host);
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('name');

    select.value = 'price';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(fixture.componentInstance.control.value).toBe('price');
  });

  it('writes through a signal form field', async () => {
    @Component({
      template: `
        <select libSelect [formField]="filters.sort" aria-label="Sort">
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      `,
      imports: [SelectDirective, FormField],
    })
    class Host {
      private readonly model = signal({ sort: 'name' });
      readonly filters = form(this.model);
    }

    const fixture = await render(Host);
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('name');

    select.value = 'price';
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.filters.sort().value()).toBe('price');
  });
});
