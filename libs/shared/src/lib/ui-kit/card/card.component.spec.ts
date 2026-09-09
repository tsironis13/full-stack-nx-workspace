import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import {
  CardBodyComponent,
  CardBodyDescriptionTemplateDirective,
  CardBodyTitleTemplateDirective,
} from './body/card-body/card-body.component';
import {
  CardComponent,
  CardBodyTemplateDirective,
  CardHeaderTemplateDirective,
} from './card.component';
import { CardHeaderContentTemplateDirective } from './header/card-header-content-template.directive';
import {
  CardActionsTemplateDirective,
  CardHeaderComponent,
} from './header/card-header/card-header.component';

describe('CardComponent', () => {
  async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
    await TestBed.configureTestingModule({
      imports: [component],
    }).compileComponents();
    const fixture = TestBed.createComponent(component);
    await fixture.whenStable();
    return fixture;
  }

  it('keeps header and body composition without default English copy', async () => {
    @Component({
      template: `
        <lib-card>
          <ng-template libCardHeader>
            <lib-card-header>
              <ng-template libCardHeaderContent>Product photo</ng-template>
              <ng-template libCardHeaderActions>
                <button type="button">Favorite</button>
              </ng-template>
            </lib-card-header>
          </ng-template>
          <ng-template libCardBody>
            <lib-card-body>
              <ng-template libCardBodyTitle>Espresso</ng-template>
              <ng-template libCardBodyDescription>Dark roast</ng-template>
            </lib-card-body>
          </ng-template>
        </lib-card>
      `,
      imports: [
        CardComponent,
        CardHeaderTemplateDirective,
        CardBodyTemplateDirective,
        CardHeaderComponent,
        CardHeaderContentTemplateDirective,
        CardActionsTemplateDirective,
        CardBodyComponent,
        CardBodyTitleTemplateDirective,
        CardBodyDescriptionTemplateDirective,
      ],
    })
    class Host {}

    const fixture = await render(Host);
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Product photo');
    expect(text).toContain('Favorite');
    expect(text).toContain('Espresso');
    expect(text).toContain('Dark roast');
    expect(text).not.toContain('card header');
    expect(text).not.toContain('card body');
  });
});
