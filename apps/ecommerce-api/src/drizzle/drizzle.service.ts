import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import * as schema from '../db/schema';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject('DB_DEV') readonly db: PostgresJsDatabase<typeof schema>
  ) {}
}
