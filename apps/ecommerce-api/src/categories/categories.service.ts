import { Injectable } from '@nestjs/common';

import { DrizzleService } from '../drizzle/drizzle.service';
import { getCategoryAttributeValuesById } from './categories.repository';

type AttributeValue = {
  value_id: number;
  value_name: string;
  product_items_count: number;
};

type GroupedAttribute = {
  attribute_id: number;
  attribute_name: string;
  values: AttributeValue[];
};

@Injectable()
export class CategoriesService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getCategoryFiltersGroupedByAttributeValuesById(categoryId: number) {
    const result = await getCategoryAttributeValuesById(
      this.drizzleService,
      categoryId
    );

    return result.reduce<GroupedAttribute[]>((acc, row) => {
      let attribute = acc.find((a) => a.attribute_id === row.attribute_id);

      if (!attribute) {
        attribute = {
          attribute_id: row.attribute_id,
          attribute_name: row.attribute_name ?? '',
          values: [],
        };
        acc.push(attribute);
      }

      attribute.values.push({
        value_id: row.value_id,
        value_name: row.value_name ?? '',
        product_items_count: row.product_items_count,
      });

      return acc;
    }, []);
  }
}
