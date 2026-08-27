import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CatalogListService } from './catalog-list.service';
import { CatalogRepository } from '../infrastructure/catalog.repository';
import { CatalogSort } from '../domain/catalog.types';

describe('CatalogListService', () => {
  let service: CatalogListService;
  const findCatalogPage = jest.fn();
  const findAttributeFacets = jest.fn();
  const isActiveRootCategory = jest.fn();
  const findActiveRootCategories = jest.fn();

  beforeEach(async () => {
    findCatalogPage.mockReset();
    findAttributeFacets.mockReset();
    isActiveRootCategory.mockReset();
    findActiveRootCategories.mockReset();

    findAttributeFacets.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogListService,
        {
          provide: CatalogRepository,
          useValue: {
            findCatalogPage,
            findAttributeFacets,
            isActiveRootCategory,
            findActiveRootCategories,
          },
        },
      ],
    }).compile();

    service = module.get(CatalogListService);
  });

  it('maps repository rows into response DTOs including empty facets', async () => {
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
      attributeFilters: undefined,
      minRating: undefined,
    });
    expect(findAttributeFacets).toHaveBeenCalledWith({
      q: undefined,
      categoryRootId: undefined,
      salePriceMin: undefined,
      salePriceMax: undefined,
      attributeFilters: undefined,
      minRating: undefined,
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
    expect(res.facets).toEqual([]);
  });

  it('returns facets from the repository in the response', async () => {
    findCatalogPage.mockResolvedValue({ total: 1, rows: [] });
    findAttributeFacets.mockResolvedValue([
      {
        attributeId: 1,
        name: 'Color',
        values: [
          { valueId: 10, value: 'Red' },
          { valueId: 11, value: 'Blue' },
        ],
      },
      {
        attributeId: 2,
        name: 'Size',
        values: [{ valueId: 20, value: 'M' }],
      },
    ]);

    const res = await service.list({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.newest,
    });

    expect(res.facets).toHaveLength(2);
    expect(res.facets[0]).toMatchObject({
      attributeId: 1,
      name: 'Color',
      values: [
        { valueId: 10, value: 'Red' },
        { valueId: 11, value: 'Blue' },
      ],
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
      attributeFilters: undefined,
      minRating: undefined,
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
      attributeFilters: undefined,
      minRating: undefined,
    });
  });

  it('parses single attribute filter and passes to repository', async () => {
    findCatalogPage.mockResolvedValue({ total: 0, rows: [] });

    await service.list({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.newest,
      rawAttributeFilters: '1:10',
    });

    const expectedFilter = [{ attributeId: 1, valueId: 10 }];
    expect(findCatalogPage).toHaveBeenCalledWith(
      expect.objectContaining({ attributeFilters: expectedFilter })
    );
    expect(findAttributeFacets).toHaveBeenCalledWith(
      expect.objectContaining({ attributeFilters: expectedFilter })
    );
  });

  it('parses multiple attribute filters (AND across attributes)', async () => {
    findCatalogPage.mockResolvedValue({ total: 0, rows: [] });

    await service.list({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.newest,
      rawAttributeFilters: ['1:10', '2:20'],
    });

    const expectedFilters = [
      { attributeId: 1, valueId: 10 },
      { attributeId: 2, valueId: 20 },
    ];
    expect(findCatalogPage).toHaveBeenCalledWith(
      expect.objectContaining({ attributeFilters: expectedFilters })
    );
  });

  it('rejects a malformed attributeFilter (missing colon)', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        rawAttributeFilters: '1-10',
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(findCatalogPage).not.toHaveBeenCalled();
  });

  it('rejects attributeFilter with non-integer attributeId', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        rawAttributeFilters: 'abc:10',
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects attributeFilter with non-positive valueId', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        rawAttributeFilters: '1:0',
      })
    ).rejects.toBeInstanceOf(BadRequestException);
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

  it('maps averageRating and reviewCount onto catalog list items', async () => {
    findCatalogPage.mockResolvedValue({
      total: 2,
      rows: [
        {
          productId: 1,
          name: 'Rated',
          mainProductItemId: 10,
          salePrice: 12.5,
          originalPrice: 20,
          primaryImageUrl: null,
          additionalOptionsCount: 0,
          averageRating: 4.5,
          reviewCount: 2,
        },
        {
          productId: 2,
          name: 'Unrated',
          mainProductItemId: 11,
          salePrice: 9,
          originalPrice: null,
          primaryImageUrl: null,
          additionalOptionsCount: 0,
          averageRating: null,
          reviewCount: 0,
        },
      ],
    });

    const res = await service.list({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.newest,
    });

    expect(res.items[0]).toMatchObject({
      productId: 1,
      averageRating: 4.5,
      reviewCount: 2,
    });
    expect(res.items[1]).toMatchObject({
      productId: 2,
      averageRating: null,
      reviewCount: 0,
    });
  });

  it('passes rating_desc sort and minRating with other filters to the repository', async () => {
    isActiveRootCategory.mockResolvedValue(true);
    findCatalogPage.mockResolvedValue({ total: 0, rows: [] });

    await service.list({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.rating_desc,
      q: 'shirt',
      categoryRootId: 3,
      minSalePrice: '10',
      maxSalePrice: '50',
      rawAttributeFilters: '1:10',
      minRating: 4,
    });

    expect(findCatalogPage).toHaveBeenCalledWith({
      page: 1,
      pageSize: 12,
      sort: CatalogSort.rating_desc,
      q: 'shirt',
      categoryRootId: 3,
      salePriceMin: 10,
      salePriceMax: 50,
      attributeFilters: [{ attributeId: 1, valueId: 10 }],
      minRating: 4,
    });
    expect(findAttributeFacets).toHaveBeenCalledWith({
      q: 'shirt',
      categoryRootId: 3,
      salePriceMin: 10,
      salePriceMax: 50,
      attributeFilters: [{ attributeId: 1, valueId: 10 }],
      minRating: 4,
    });
  });

  it('rejects minRating below 1', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        minRating: 0,
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(findCatalogPage).not.toHaveBeenCalled();
  });

  it('rejects minRating above 5', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        minRating: 6,
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(findCatalogPage).not.toHaveBeenCalled();
  });

  it('rejects non-integer minRating', async () => {
    await expect(
      service.list({
        page: 1,
        pageSize: 12,
        sort: CatalogSort.newest,
        minRating: 3.5,
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(findCatalogPage).not.toHaveBeenCalled();
  });
});
