import { Get, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  @Get('/test')
  test() {
    return { x: 'test' };
  }
}
