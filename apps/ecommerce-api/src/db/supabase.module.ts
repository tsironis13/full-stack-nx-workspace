import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SupabaseSdkModule } from './supabase-sdk.module';

@Module({
  imports: [
    SupabaseSdkModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        auth: {
          url: configService.get('SUPABASE_AUTH_URL') as string,
          key: configService.get('SUPABASE_SERVICE_ROLE_KEY') as string,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [SupabaseSdkModule],
})
export class SupabaseModule {}
