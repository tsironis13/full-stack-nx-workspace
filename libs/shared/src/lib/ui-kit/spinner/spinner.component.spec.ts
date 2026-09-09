import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('is an inline status with the caller-provided accessible name', async () => {
    @Component({
      template: `<lib-spinner ariaLabel="Loading catalog" />`,
      imports: [SpinnerComponent],
    })
    class Host {}

    const fixture = await render(Host);
    const status = fixture.nativeElement.querySelector(
      '[role="status"]',
    ) as HTMLElement;

    expect(status).not.toBeNull();
    expect(status.getAttribute('aria-label')).toBe('Loading catalog');
    expect(fixture.nativeElement.querySelector('dialog')).toBeNull();
    expect(status.textContent?.trim()).toBe('');
  });
});
