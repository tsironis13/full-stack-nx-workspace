import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { AUTH_API_URL_TOKEN } from '@full-stack-nx-workspace/auth-web';
import { appRoutes } from './app.routes';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AUTH_API_URL_TOKEN, useValue: '/' },
        provideRouter(appRoutes),
      ],
    });
    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should render title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Header');
  });
});
