import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ImageComponent } from './image.component';

describe('ImageComponent', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('renders the provided image path on a native img', async () => {
    @Component({
      template: `
        <lib-image
          [image]="{
            path: '/assets/product.png',
            priority: true,
            fill: false,
            width: 320,
            height: 240,
          }"
        />
      `,
      imports: [ImageComponent],
    })
    class Host {}

    const fixture = await render(Host);
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(img).not.toBeNull();
    expect(img.getAttribute('ng-src') ?? img.getAttribute('src')).toContain(
      '/assets/product.png',
    );
    expect(img.width).toBe(320);
    expect(img.height).toBe(240);
  });
});
