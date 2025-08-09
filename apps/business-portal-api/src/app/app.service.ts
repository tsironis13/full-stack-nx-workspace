import { Injectable } from '@nestjs/common';

import { DrizzleService } from '../drizzle/drizzle.service';

@Injectable()
export class AppService {
  constructor(private drizzleService: DrizzleService) {}

  async getData(): Promise<{ message: string; roles: any[] }> {
    const x = await this.drizzleService.db.query.roles.findMany();
    console.log(x);
    return { message: 'Hello API', roles: x };
  }
}
