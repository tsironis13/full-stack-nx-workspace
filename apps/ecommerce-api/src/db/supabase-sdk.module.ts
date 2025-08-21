import { Module } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  SupabaseSdkModuleOptions,
} from './supabase-sdk.module-definition';

export const SUPABASE_SDK_CLIENT = 'SUPABASE_SDK_CLIENT';

@Module({
  providers: [
    {
      provide: SUPABASE_SDK_CLIENT,
      useFactory: (options: SupabaseSdkModuleOptions) =>
        createClient(options.auth.url, options.auth.key),
      inject: [MODULE_OPTIONS_TOKEN],
    },
  ],
  exports: [SUPABASE_SDK_CLIENT],
})
export class SupabaseSdkModule extends ConfigurableModuleClass {}
