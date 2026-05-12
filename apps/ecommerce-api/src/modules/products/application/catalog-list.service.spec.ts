import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CatalogListService } from './catalog-list.service';
import { CatalogRepository } from '../infrastructure/catalog.repository';
import { CatalogSort } from '../domain/catalog.types';

describe('CatalogListService', () => {
  let service: CatalogListService;
  const findCatalogPage = jest.fn();
  const isActiveRootCategory = jest.fn();
  const findActiveRootCategories = jest.fn();

  beforeEach(async () => {
    findCatalogPage.mockReset();
    isActiveRootCategory.mockReset();
    findActiveRootCategories.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogListService,
        {
          provide: CatalogRepository,
          useValue: {
            findCatalogPage,
            isActiveRootCategory,
            findActiveRootCategories,
          },
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
      categoryRootId: undefined,
      salePriceMin: undefined,
      salePriceMax: undefined,
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

  it('passes categoryRootId and name search together to the repository', async () => {
    isActiveRootCategory.mockResolvedValue(true);
    findCatalogPage.mockResolvedValue({ total: 0, rows: [] });

    await service.list({
      page: 2,
      pageSize: 24,
      sort: CatalogSort.price_asc,
      q: 'blue',
      categoryRootId: 7,
    });

    expect(isActiveRootCategory).toHaveBeenCalledWith(7);
    expect(findCatalogPage).toHaveBeenCalledWith({
      page: 2,
      pageSize: 24,
      sort: CatalogSort.price_asc,
      q: 'blue',
      categoryRootId: 7,
      salePriceMin: undefined,
      salePriceMax: undefined,
    });
  });

  it('passes sale price bounds with search, category, and sort (slices 02–04)', async () => {
    isActiveRootCategory.mockResolvedValue(true);
    findCatalogPage.mockResolvedValue({ total: 0, rows: [] });

    await service.list({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.price_desc,
      q: 'coat',
      categoryRootId: 3,
      minSalePrice: '10.5',
      maxSalePrice: '99',
    });

    expect(isActiveRootCategory).toHaveBeenCalledWith(3);
    expect(findCatalogPage).toHaveBeenCalledWith({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.price_desc,
      q: 'coat',
      categoryRootId: 3,
      salePriceMin: 10.5,
      salePriceMax: 99,
    });
  });

  it('rejects minSalePrice greater than maxSalePrice', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        minSalePrice: '50',
        maxSalePrice: '20',
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(findCatalogPage).not.toHaveBeenCalled();
  });

  it('rejects non-finite minSalePrice', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        minSalePrice: 'x',
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(findCatalogPage).not.toHaveBeenCalled();
  });

  it('rejects negative maxSalePrice', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        maxSalePrice: '-1',
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(findCatalogPage).not.toHaveBeenCalled();
  });

  it('rejects a categoryRootId that is not an active root category', async () => {
    isActiveRootCategory.mockResolvedValue(false);

    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        categoryRootId: 99,
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(findCatalogPage).not.toHaveBeenCalled();
  });

  it('returns sorted active root categories', async () => {
    findActiveRootCategories.mockResolvedValue([
      { id: 2, name: 'B' },
      { id: 1, name: 'A' },
    ]);

    const res = await service.listCategoryRoots();

    expect(findActiveRootCategories).toHaveBeenCalled();
    expect(res.roots).toEqual([
      { id: 2, name: 'B' },
      { id: 1, name: 'A' },
    ]);
  });
});
