import { CurrencyPipe } from '@angular/common';
import { Pipe, type PipeTransform } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ecommerceTranslocoTestingModule } from '../../../core/public-api';
import { ShoppingStore } from '../application/public-api';
import { RecommendedProductWidget } from './recommended-product.widget';

@Pipe({ name: 'currency' })
class CurrencyStubPipe implements PipeTransform {
  transform(value: unknown): string {
    return String(value ?? '');
  }
}

describe('RecommendedProductWidget UI Theme', () => {
  beforeEach(() => {
    TestBed.overrideComponent(RecommendedProductWidget, {
      remove: { imports: [CurrencyPipe] },
      add: { imports: [CurrencyStubPipe] },
    });
    TestBed.configureTestingModule({
      imports: [RecommendedProductWidget],
      providers: [
        ecommerceTranslocoTestingModule(),
        {
          provide: ShoppingStore,
          useValue: { startFromRecommendation: jest.fn() },
        },
      ],
    });
  });

  it('renders stored Product name without leftover chrome or kit Add', () => {
    const fixture = TestBed.createComponent(RecommendedProductWidget);
    fixture.componentRef.setInput('toolCall', {
      args: {
        product: {
          id: 7,
          name: 'Αδιάβροχο παλτό',
          price: 49.9,
        },
      },
    });
    fixture.detectChanges();

    const add = fixture.nativeElement.querySelector(
      '.recommend-card__add',
    ) as HTMLButtonElement;

    expect(fixture.nativeElement.textContent).toContain('Αδιάβροχο παλτό');
    expect(add).toBeTruthy();
    expect(add.hasAttribute('libButton')).toBe(false);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/\bgray-/);
    expect(fixture.nativeElement.innerHTML).not.toMatch(/--p-/);
  });
});
