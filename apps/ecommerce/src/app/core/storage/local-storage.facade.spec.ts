import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';

describe('LocalStorageFacade', () => {
  let facade: LocalStorageFacade;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(LocalStorageFacade);
  });

  it('returns null for missing key', () => {
    expect(facade.getJson('missing')).toBeNull();
  });

  it('round-trips JSON', () => {
    facade.setJson('k', { a: 1 });
    expect(facade.getJson<{ a: number }>('k')).toEqual({ a: 1 });
  });

  it('returns null for bogus JSON without throwing', () => {
    localStorage.setItem('bad', 'not-json{');
    expect(facade.getJson('bad')).toBeNull();
  });

  it('remove drops key', () => {
    facade.setJson('x', 1);
    facade.remove('x');
    expect(facade.getJson('x')).toBeNull();
  });

  it('clearByPrefix removes matching keys only', () => {
    facade.setJson('pre:a', 1);
    facade.setJson('pre:b', 2);
    facade.setJson('other', 3);
    facade.clearByPrefix('pre:');
    expect(facade.getJson('pre:a')).toBeNull();
    expect(facade.getJson('pre:b')).toBeNull();
    expect(facade.getJson('other')).toEqual(3);
  });

  it('getJson returns null on server platform without touching storage', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LocalStorageFacade,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const serverFacade = TestBed.inject(LocalStorageFacade);
    localStorage.setItem('srv', '"x"');
    expect(serverFacade.getJson('srv')).toBeNull();
  });
});
