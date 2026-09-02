import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { PinoLogger } from '@mastra/loggers';
import {
  MastraStorageExporter,
  MastraPlatformExporter,
  Observability,
  SensitiveDataFilter,
} from '@mastra/observability';
import { registerApiRoute } from '@mastra/core/server';

import { shoppingAgent } from './agents/shopping-agent';
import { agUiRouteHandler } from './routes/ag-ui-route';

export const mastra = new Mastra({
  agents: { shoppingAgent },
  storage: new LibSQLStore({
    id: 'ecommerce-storage',
    url: 'file:./ecommerce.db',
  }),
  logger: new PinoLogger({
    name: 'Ecommerce-Logger',
    level: 'info',
  }),
  // Persists agent/tool/workflow spans into the LibSQL store so Mastra
  // Studio's Observability tab can show traces. `realtime` flushes each
  // event immediately — recommended for local dev with LibSQL per
  // https://mastra.ai/reference/storage/libsql#observability.
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'ecommerce',
        exporters: [new MastraStorageExporter(), new MastraPlatformExporter()],
        spanOutputProcessors: [new SensitiveDataFilter()],
      },
    },
  }),
  server: {
    port: 3021,
    host: 'localhost',
    cors: {
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    },
    apiRoutes: [
      registerApiRoute('/ag-ui/:agentId', {
        method: 'POST',
        handler: agUiRouteHandler,
      }),
    ],
  },
});
