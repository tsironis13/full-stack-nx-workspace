import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthIfDirective } from './auth.directive';
import { AuthStore } from '../application/public-api';
import type { AuthUser } from '../domain/public-api';

// Mock AuthStore - AuthStore is a signalStore, so we create a mock with the required signals
type MockAuthStore = {
  authUser: ReturnType<typeof signal<AuthUser | null>>;
  isPending: ReturnType<typeof signal<boolean>>;
};

const createMockAuthStore = (
  authUser: AuthUser | null,
  isPending = false
): MockAuthStore => {
  return {
    authUser: signal(authUser),
    isPending: signal(isPending),
  };
};

@Component({
  template: `
    <div *authIf="authCondition; else elseTemplate; pending: pendingTemplate">
      <div class="authorized-content">Authorized Content</div>
    </div>
    <ng-template #elseTemplate>
      <div class="denied-content">Denied Content</div>
    </ng-template>
    <ng-template #pendingTemplate>
      <div class="pending-content">Pending Content</div>
    </ng-template>
  `,
  standalone: true,
  imports: [AuthIfDirective],
})
class TestComponent {
  authCondition: string | string[] = 'connected';
}

describe('AuthIfDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let mockAuthStore: ReturnType<typeof createMockAuthStore>;

  beforeEach(async () => {
    mockAuthStore = createMockAuthStore(null, false);

    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: mockAuthStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockAuthStore.authUser.set(null);
      mockAuthStore.isPending.set(false);
    });

    it('should show else template when user is not authenticated', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.denied-content')).toBeTruthy();
      expect(compiled.querySelector('.authorized-content')).toBeFalsy();
    });
  });

  describe('when authentication is pending', () => {
    beforeEach(() => {
      mockAuthStore.authUser.set(null);
      mockAuthStore.isPending.set(true);
    });

    it('should show pending template when authentication is pending', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.pending-content')).toBeTruthy();
      expect(compiled.querySelector('.authorized-content')).toBeFalsy();
      expect(compiled.querySelector('.denied-content')).toBeFalsy();
    });

    it('should not proceed with authorization check when pending', () => {
      // When pending, the effect should return early
      // We verify this by checking that authorized content is not shown
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeFalsy();
      expect(compiled.querySelector('.pending-content')).toBeTruthy();
    });
  });

  describe('when user is authenticated', () => {
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    beforeEach(() => {
      mockAuthStore.authUser.set(mockUser);
      mockAuthStore.isPending.set(false);
    });

    it('should show authorized content when user is authenticated with "connected" condition', () => {
      component.authCondition = 'connected';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
      expect(compiled.querySelector('.denied-content')).toBeFalsy();
    });

    it('should show authorized content when user role matches condition', () => {
      component.authCondition = 'user';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
      expect(compiled.querySelector('.denied-content')).toBeFalsy();
    });

    it('should show denied content when user role does not match condition', () => {
      component.authCondition = 'admin';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.denied-content')).toBeTruthy();
      expect(compiled.querySelector('.authorized-content')).toBeFalsy();
    });

    it('should show authorized content when user role matches any condition in array', () => {
      component.authCondition = ['admin', 'user'];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
      expect(compiled.querySelector('.denied-content')).toBeFalsy();
    });

    it('should show denied content when user role does not match any condition in array', () => {
      component.authCondition = ['admin', 'moderator'];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.denied-content')).toBeTruthy();
      expect(compiled.querySelector('.authorized-content')).toBeFalsy();
    });

    it('should handle empty string condition as "connected"', () => {
      component.authCondition = '';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
    });

    it('should handle whitespace-only condition as "connected"', () => {
      component.authCondition = '   ';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
    });

    it('should trim and lowercase role conditions', () => {
      component.authCondition = '  USER  ';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
    });
  });

  describe('callbacks', () => {
    const mockUser: AuthUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    beforeEach(() => {
      mockAuthStore.authUser.set(mockUser);
      mockAuthStore.isPending.set(false);
    });

    it('should call authIfAuthorized callback when user is authorized', async () => {
      const authorizedCallback = vi.fn();
      component.authCondition = 'user';

      // Create a new component with callback
      @Component({
        template: `
          <div
            *authIf="'user'; authorized: onAuthorized"
            class="authorized-content"
          >
            Content
          </div>
        `,
        standalone: true,
        imports: [AuthIfDirective],
      })
      class CallbackTestComponent {
        onAuthorized = authorizedCallback;
      }

      const callbackFixture = TestBed.createComponent(CallbackTestComponent);
      callbackFixture.detectChanges();
      await callbackFixture.whenStable();

      expect(authorizedCallback).toHaveBeenCalledWith(mockUser);
    });

    it('should call authIfDenied callback when access is denied', async () => {
      const deniedCallback = vi.fn();
      component.authCondition = 'admin';

      // Create a new component with callback
      @Component({
        template: `
          <div *authIf="'admin'; denied: onDenied" class="denied-content">
            Content
          </div>
        `,
        standalone: true,
        imports: [AuthIfDirective],
      })
      class DeniedCallbackTestComponent {
        onDenied = deniedCallback;
      }

      const deniedFixture = TestBed.createComponent(
        DeniedCallbackTestComponent
      );
      deniedFixture.detectChanges();
      await deniedFixture.whenStable();

      expect(deniedCallback).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle null authUser gracefully', () => {
      mockAuthStore.authUser.set(null);
      mockAuthStore.isPending.set(false);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.denied-content')).toBeTruthy();
    });

    it('should handle empty array condition', () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      mockAuthStore.authUser.set(mockUser);
      mockAuthStore.isPending.set(false);
      component.authCondition = [];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      // Empty array should allow access (no conditions = allow all)
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
    });

    it('should handle array with empty strings', () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      mockAuthStore.authUser.set(mockUser);
      mockAuthStore.isPending.set(false);
      component.authCondition = ['', '  ', 'user'];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
    });
  });

  describe('reactive updates', () => {
    it('should update when authUser changes', () => {
      mockAuthStore.authUser.set(null);
      mockAuthStore.isPending.set(false);
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.denied-content')).toBeTruthy();

      // Update authUser
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      mockAuthStore.authUser.set(mockUser);
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();
      expect(compiled.querySelector('.denied-content')).toBeFalsy();
    });

    it('should update when isPending changes', () => {
      const mockUser: AuthUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      mockAuthStore.authUser.set(mockUser);
      mockAuthStore.isPending.set(false);
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.authorized-content')).toBeTruthy();

      // Set to pending
      mockAuthStore.isPending.set(true);
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.pending-content')).toBeTruthy();
      expect(compiled.querySelector('.authorized-content')).toBeFalsy();
    });
  });
});
