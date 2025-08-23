import { PgColumn, PgSelect } from 'drizzle-orm/pg-core';
import { SQL } from 'drizzle-orm';

export function withPagination<T extends PgSelect>(
  qb: T,
  orderByColumn: PgColumn | SQL | SQL.Aliased,
  page: number,
  pageSize: number
) {
  return qb
    .orderBy(orderByColumn)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}
