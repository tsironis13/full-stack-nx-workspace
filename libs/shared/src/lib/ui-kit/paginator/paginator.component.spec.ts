import { Component, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('emits pageChange from previous, next, and page-size using required accessible names', async () => {
    const onPageChange = vi.fn();

    @Component({
      template: `
        <lib-paginator
          [page]="page()"
          [pageSize]="pageSize()"
          [total]="48"
          [pageSizeOptions]="[12, 24, 48]"
          previousLabel="Previous page"
          nextLabel="Next page"
          pageSizeLabel="Items per page"
          (pageChange)="onPageChange($event)"
        />
      `,
      imports: [PaginatorComponent],
    })
    class Host {
      readonly page = signal(2);
      readonly pageSize = signal(12);
      onPageChange = onPageChange;
    }

    const fixture = await render(Host);
    const previous = fixture.nativeElement.querySelector(
      '[aria-label="Previous page"]',
    ) as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector(
      '[aria-label="Next page"]',
    ) as HTMLButtonElement;
    const pageSize = fixture.nativeElement.querySelector(
      '[aria-label="Items per page"]',
    ) as HTMLSelectElement;

    expect(previous.tagName).toBe('BUTTON');
    expect(next.tagName).toBe('BUTTON');
    expect(pageSize.tagName).toBe('SELECT');
    expect(fixture.nativeElement.textContent).toContain('2 / 4');

    previous.click();
    await fixture.whenStable();
    expect(onPageChange).toHaveBeenCalledWith({ page: 1, pageSize: 12 });

    onPageChange.mockClear();
    next.click();
    await fixture.whenStable();
    expect(onPageChange).toHaveBeenCalledWith({ page: 3, pageSize: 12 });

    onPageChange.mockClear();
    pageSize.value = '24';
    pageSize.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(onPageChange).toHaveBeenCalledWith({ page: 1, pageSize: 24 });
  });

  it('disables previous on the first page and next on the last page', async () => {
    @Component({
      template: `
        <lib-paginator
          [page]="page()"
          [pageSize]="12"
          [total]="24"
          [pageSizeOptions]="[12]"
          previousLabel="Previous page"
          nextLabel="Next page"
          pageSizeLabel="Items per page"
        />
      `,
      imports: [PaginatorComponent],
    })
    class Host {
      readonly page = signal(1);
    }

    const fixture = await render(Host);
    const previous = () =>
      fixture.nativeElement.querySelector(
        '[aria-label="Previous page"]',
      ) as HTMLButtonElement;
    const next = () =>
      fixture.nativeElement.querySelector(
        '[aria-label="Next page"]',
      ) as HTMLButtonElement;

    expect(previous().disabled).toBe(true);
    expect(next().disabled).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('1 / 2');

    fixture.componentInstance.page.set(2);
    await fixture.whenStable();

    expect(previous().disabled).toBe(false);
    expect(next().disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('2 / 2');
  });
});
