import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';
import boundaries from 'eslint-plugin-boundaries';
import angular from 'angular-eslint';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    plugins: {
      boundaries,
    },
    processor: angular.processInlineTemplates,
    rules: {
      ...boundaries.configs.strict.rules,
      'boundaries/element-types': [
        'error',
        {
          // without explicit type, depending on (importing from) files is disallowed
          default: 'disallow',
          rules: [
            {
              from: 'main',
              allow: [['app'], ['env']],
            },
            {
              from: 'core',
              allow: [
                ['env'],
                // the core can depend on itself (within a single app)
                ['core'],
                ['lib-api'], // core can depend on the public api of a library
              ],
            },
            {
              from: 'ui',
              allow: [['lib-api'], ['ui']],
            },
            {
              from: 'layout',
              allow: [
                ['lib-api'],
                ['env'],
                ['core-api'],
                ['ui-api'],
                ['pattern-api'],
                ['layout'],
                ['domain-routes'],
              ],
            },
            {
              from: 'app',
              allow: [
                ['lib-api'],
                ['app'],
                ['env'],
                ['core-api'],
                ['layout'],
                ['ui-api'],
              ],
            },
            {
              from: 'pattern',
              allow: [['lib-api'], ['env'], ['core-api'], ['ui-api']],
            },
            {
              from: ['domain-routes'],
              allow: [
                ['lib-api'],
                ['env'],
                ['core-api'],
                ['pattern-api'],
                ['domain-routes', { domain: '!${from.domain}' }],
                ['domain-data-api', { domain: '${from.domain}' }],
                ['domain-feature', { domain: '${from.domain}' }],
                ['domain-infrastructure-api', { domain: '${from.domain}' }],
              ],
            },
            {
              from: ['domain-infrastructure'],
              allow: [
                ['env'],
                ['core-api'],
                ['domain-infrastructure', { domain: '${from.domain}' }],
              ],
            },
            {
              from: ['domain-data'],
              allow: [
                ['env'],
                ['core-api'],
                ['domain-data', { domain: '${from.domain}' }],
                ['domain-infrastructure-api', { domain: '${from.domain}' }],
              ],
            },
            {
              from: ['domain-feature'],
              allow: [
                ['env'],
                ['core-api'],
                ['pattern-api'],
                ['ui-api'],
                [
                  'domain-feature',
                  { domain: '${from.domain}', feature: '${from.feature}' },
                ],
                ['domain-data-api', { domain: '${from.domain}' }],
                ['domain-shared', { domain: '${from.domain}' }],
              ],
            },
            {
              from: ['domain-shared'],
              allow: [
                ['env'],
                ['core-api'],
                ['pattern-api'],
                ['ui-api'],
                ['domain-data-api', { domain: '${from.domain}' }],
              ],
            },
            {
              from: 'lib-api',
              allow: [['lib', { app: '${from.lib}' }]],
            },
            {
              from: 'lib',
              allow: [['lib', { app: '${from.lib}' }]],
            },
          ],
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
    settings: {
      'import/resolver': {
        // recognize both static and dynamic Typescript imports
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/ignore': [],
      'boundaries/dependency-nodes': ['import', 'dynamic-import'],
      'boundaries/elements': [
        {
          type: 'env',
          pattern: 'environments',
        },
        // helper types
        {
          type: 'main',
          mode: 'file',
          pattern: 'main.ts',
        },
        {
          type: 'app',
          mode: 'file',
          pattern: 'app\\.ts|app[-.].*\\.ts|app.*.ts', // app.ts, app.config.ts, app.spec.ts, app-routes.ts, app.component.ts
        },
        // architectural types
        {
          type: 'core-api',
          mode: 'file',
          pattern: 'core/**/public-api.ts',
        },
        {
          type: 'core',
          pattern: 'core',
        },
        {
          type: 'ui-api',
          mode: 'file',
          pattern: 'ui/**/public-api.ts',
        },
        {
          type: 'ui',
          pattern: 'ui',
        },
        {
          type: 'layout',
          pattern: 'layout',
        },
        {
          type: 'pattern-api',
          mode: 'file',
          pattern: 'pattern/**/public-api.ts',
        },
        {
          type: 'pattern',
          pattern: 'pattern',
        },
        {
          type: 'domain-routes', // distinction between routes and implementation; will be important for the rules
          mode: 'file',
          pattern: 'domains/*/api/*.routes.ts',
          capture: ['domain'],
        },
        {
          type: 'domain-shared',
          pattern: 'domains/*/feat-shared',
          capture: ['domain'],
        },
        {
          type: 'domain-feature',
          pattern: 'domains/*/feat-(*)',
          capture: ['domain', 'feature'],
        },
        {
          type: 'domain-presentation-api',
          mode: 'file',
          pattern: 'domains/*/presentation/public-api.ts',
          capture: ['domain'],
        },
        {
          type: 'domain-presentation',
          pattern: 'domains/*/presentation',
          capture: ['domain'],
        },
        {
          type: 'domain-data-api',
          mode: 'file',
          pattern: 'domains/*/data/public-api.ts',
          capture: ['domain'],
        },
        {
          type: 'domain-data',
          pattern: 'domains/*/data',
          capture: ['domain'],
        },
        {
          type: 'domain-infrastructure-api',
          mode: 'file',
          pattern: 'domains/*/infrastructure/public-api.ts',
          capture: ['domain'],
        },
        {
          type: 'domain-infrastructure',
          pattern: 'domains/*/infrastructure',
          capture: ['domain'],
        },
        // library types
        {
          type: 'lib-api',
          mode: 'file',
          pattern: 'libs/*/public-api.ts',
          capture: ['lib'],
        },
        {
          type: 'lib',
          pattern: 'libs/*',
          capture: ['lib'],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
