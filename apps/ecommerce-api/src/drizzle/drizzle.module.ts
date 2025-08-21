import { Global, Module } from '@nestjs/common';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';

import * as schema from '../db/schema';
import { DrizzleService } from './drizzle.service';

@Global()
@Module({
  imports: [
    // Method #1: Pass options object
    DrizzlePostgresModule.register({
      tag: 'DB_DEV',
      postgres: {
        url: process.env.DATABASE_URL as string,
      },
      config: { schema: { ...schema } },
    }),
  ],
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
