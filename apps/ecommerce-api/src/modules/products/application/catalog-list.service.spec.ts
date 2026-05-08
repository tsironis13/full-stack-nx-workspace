import { Test, TestingModule } from '@nestjs/testing';

import { CatalogListService } from './catalog-list.service';
import { CatalogRepository } from '../infrastructure/catalog.repository';
import { CatalogSort } from '../domain/catalog.types';

describe('CatalogListService', () => {
  let service: CatalogListService;
  const findCatalogPage = jest.fn();

  beforeEach(async () => {
    findCatalogPage.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogListService,
        {
          provide: CatalogRepository,
          useValue: { findCatalogPage },
        },
      ],
    }).compile();

    service = module.get(CatalogListService);
  });

  it('maps repository rows into response DTOs', async () => {
    findCatalogPage.mockResolvedValue({
      total: 2,
      rows: [
        {
          productId: 1,
          name: 'Shirt',
          mainProductItemId: 10,
          salePrice: 12.5,
          originalPrice: 20,
          primaryImageUrl: 'https://example.com/a.jpg',
          additionalOptionsCount: 2,
        },
      ],
    });

    const res = await service.list({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.newest,
    });

    expect(findCatalogPage).toHaveBeenCalledWith({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.newest,
      q: undefined,
    });
    expect(res.total).toBe(2);
    expect(res.items).toHaveLength(1);
    expect(res.items[0]).toMatchObject({
      productId: 1,
      name: 'Shirt',
      mainProductItemId: 10,
      salePrice: 12.5,
      primaryImageUrl: 'https://example.com/a.jpg',
      additionalOptionsCount: 2,
    });
  });
});
