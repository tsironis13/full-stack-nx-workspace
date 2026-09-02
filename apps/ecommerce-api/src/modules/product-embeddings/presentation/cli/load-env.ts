/**
 * Side-effect import: loads workspace `.env` files before Nest/Drizzle read
 * `DATABASE_URL` at module-evaluation time. Must stay the first import in `run.ts`.
 */
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
loadWorkspaceEnv();

function loadWorkspaceEnv(): void {
  const loadEnvFile = (
    process as NodeJS.Process & { loadEnvFile?: (path: string) => void }
  ).loadEnvFile;
  if (typeof loadEnvFile !== 'function') {
    return;
  }

  let dir = process.cwd();
  while (dir !== resolve(dir, '..')) {
    if (existsSync(join(dir, 'nx.json'))) {
      for (const relative of ['.env', 'apps/ecommerce-api/.env']) {
        const path = join(dir, relative);
        if (existsSync(path)) {
          loadEnvFile(path);
        }
      }
      return;
    }
    dir = resolve(dir, '..');
  }
}
