import { TestBed } from '@angular/core/testing';

import { ecommerceTranslocoTestingModule } from '../../../../core/public-api';
import { CatalogBrowseToolbarComponent } from './catalog-browse-toolbar.component';

describe('CatalogBrowseToolbarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatalogBrowseToolbarComponent],
      providers: [ecommerceTranslocoTestingModule()],
    });
  });

  it('uses kit Input and Select for catalog search and sort', () => {
    const fixture = TestBed.createComponent(CatalogBrowseToolbarComponent);
    fixture.componentRef.setInput('sort', 'newest');
    fixture.componentRef.setInput('sortOptions', [
      { value: 'newest', labelKey: 'catalog.sort.newest' },
    ]);
    fixture.detectChanges();

    const search = fixture.nativeElement.querySelector(
      '#catalog-search',
    ) as HTMLInputElement;
    const sort = fixture.nativeElement.querySelector(
      '#catalog-sort',
    ) as HTMLSelectElement;

    expect(search).toBeTruthy();
    expect(search.hasAttribute('libInput')).toBe(true);
    expect(sort).toBeTruthy();
    expect(sort.hasAttribute('libSelect')).toBe(true);
  });
});
