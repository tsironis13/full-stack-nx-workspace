import { ConfigurableModuleBuilder } from '@nestjs/common';

export type SupabaseSdkModuleOptions = {
  auth: {
    url: string;
    key: string;
  };
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<SupabaseSdkModuleOptions>().build();
