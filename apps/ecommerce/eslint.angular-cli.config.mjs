import boundaries from 'eslint-plugin-boundaries';
import angular from 'angular-eslint';

/**
 * Angular CLI app boundaries for eslint-plugin-boundaries v7.
 * Compose this after the workspace root config from `ng add angular-eslint`.
 *
 * @see https://www.jsboundaries.dev/docs/rules/dependencies/
 */
const sameDomain = {
  domain: '{{ from.element.captured.domain }}',
};

const sameFeature = {
  domain: '{{ from.element.captured.domain }}',
  feature: '{{ from.element.captured.feature }}',
};

const otherDomain = {
  domain: '!{{ from.element.captured.domain }}',
};

const project = ['project'];

export default [
  {
    files: ['**/*.ts'],
    plugins: {
      boundaries,
    },
    processor: angular.processInlineTemplates,
    rules: {
      ...boundaries.configs.strict.rules,
      'boundaries/dependencies': [
        'error',
        {
          // without an explicit allow, importing from another element is disallowed
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'main' } },
              allow: { to: { element: { type: ['app', 'env'] } } },
            },
            {
              from: { element: { type: 'core' } },
              allow: {
                to: { element: { type: ['env', 'core', 'lib-api'] } },
              },
            },
            {
              from: { element: { type: 'ui' } },
              allow: { to: { element: { type: ['lib-api', 'ui'] } } },
            },
            {
              from: { element: { type: 'layout' } },
              allow: {
                to: {
                  element: {
                    type: [
                      'lib-api',
                      'env',
                      'core-api',
                      'ui-api',
                      'pattern-api',
                      'layout',
                      'domain-routes',
                      'domain-application-anti-corruption-layer-api',
                    ],
                  },
                },
              },
            },
            {
              from: { element: { type: 'app' } },
              allow: {
                to: {
                  element: {
                    type: [
                      'themes',
                      'lib-api',
                      'app',
                      'env',
                      'core-api',
                      'layout',
                      'ui-api',
                      'domain-routes',
                    ],
                  },
                },
              },
            },
            {
              from: { element: { type: 'pattern' } },
              allow: {
                to: {
                  element: { type: ['lib-api', 'env', 'core-api', 'ui-api'] },
                },
              },
            },
            {
              from: {
                element: {
                  type: 'domain-application-anti-corruption-layer-api',
                },
              },
              allow: {
                to: {
                  element: {
                    type: [
                      'domain-application-api',
                      'domain-application-anti-corruption-layer-api',
                    ],
                  },
                },
              },
            },
            {
              from: { element: { type: 'domain-routes' } },
              allow: {
                to: [
                  {
                    element: {
                      type: ['lib-api', 'env', 'core-api', 'pattern-api'],
                    },
                  },
                  {
                    element: { type: 'domain-routes', captured: otherDomain },
                  },
                  {
                    element: {
                      type: [
                        'domain-feature',
                        'domain-infrastructure-api',
                        'domain-application-api',
                      ],
                      captured: sameDomain,
                    },
                  },
                ],
              },
            },
            {
              from: { element: { type: 'domain-infrastructure' } },
              allow: {
                to: [
                  { element: { type: ['env', 'core-api'] } },
                  {
                    element: {
                      type: 'domain-infrastructure',
                      captured: sameDomain,
                    },
                  },
                ],
              },
            },
            {
              from: { element: { type: 'domain-business' } },
              allow: {
                to: {
                  element: { type: 'domain-business', captured: sameDomain },
                },
              },
            },
            {
              from: { element: { type: 'domain-feature' } },
              allow: {
                to: [
                  {
                    element: {
                      type: [
                        'env',
                        'core-api',
                        'pattern-api',
                        'ui-api',
                        'lib-api',
                      ],
                    },
                  },
                  {
                    element: { type: 'domain-feature', captured: sameFeature },
                  },
                  {
                    element: {
                      type: ['domain-application-api', 'domain-shared'],
                      captured: sameDomain,
                    },
                  },
                ],
              },
            },
            {
              from: { element: { type: 'domain-application' } },
              allow: {
                to: [
                  {
                    element: {
                      type: [
                        'env',
                        'core-api',
                        'lib-api',
                        'domain-application-anti-corruption-layer-api',
                      ],
                    },
                  },
                  {
                    element: {
                      type: 'domain-infrastructure-api',
                      captured: sameDomain,
                    },
                  },
                  {
                    element: {
                      type: 'domain-application',
                      captured: sameDomain,
                    },
                  },
                  {
                    element: {
                      type: 'domain-business-api',
                      captured: sameDomain,
                    },
                  },
                ],
              },
            },
            {
              from: { element: { type: 'domain-shared' } },
              allow: {
                to: {
                  element: {
                    type: ['env', 'core-api', 'pattern-api', 'ui-api'],
                  },
                },
              },
            },
            {
              from: { element: { type: 'lib-api' } },
              allow: {
                to: {
                  element: {
                    type: 'lib',
                    captured: { lib: '{{ from.element.captured.lib }}' },
                  },
                },
              },
            },
            {
              from: { element: { type: 'lib' } },
              allow: {
                to: {
                  element: {
                    type: 'lib',
                    captured: { lib: '{{ from.element.captured.lib }}' },
                  },
                },
              },
            },
            {
              // Last match wins, so this overrides an earlier allow when the
              // target lives in a different Angular CLI project.
              message: 'Projects must not import from other projects',
              disallow: {
                from: { element: { captured: { project: '*' } } },
                to: {
                  element: {
                    captured: {
                      project: '!{{ from.element.captured.project }}',
                    },
                  },
                },
              },
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
        typescript: {
          alwaysTryTypes: true,
        },
      },
      'boundaries/ignore': [],
      'boundaries/dependency-nodes': ['import', 'dynamic-import'],
      'boundaries/elements': [
        {
          type: 'env',
          pattern: 'projects/*/src/environments',
          capture: project,
        },
        {
          type: 'themes',
          pattern: 'projects/*/src/app/themes',
          capture: project,
        },
        {
          type: 'main',
          mode: 'file',
          pattern: 'projects/*/src/main.ts',
          capture: project,
        },
        {
          type: 'app',
          mode: 'file',
          pattern:
            'projects/*/src/app/app\\.ts|projects/*/src/app/app[-.].*\\.ts|projects/*/src/app/app.*.ts',
          capture: project,
        },
        {
          type: 'core-api',
          mode: 'file',
          pattern: 'projects/*/src/app/core/**/public-api.ts',
          capture: project,
        },
        {
          type: 'core',
          pattern: 'projects/*/src/app/core',
          capture: project,
        },
        {
          type: 'ui-api',
          mode: 'file',
          pattern: 'projects/*/src/app/ui/**/public-api.ts',
          capture: project,
        },
        {
          type: 'ui',
          pattern: 'projects/*/src/app/ui',
          capture: project,
        },
        {
          type: 'layout',
          pattern: 'projects/*/src/app/layout',
          capture: project,
        },
        {
          type: 'pattern-api',
          mode: 'file',
          pattern: 'projects/*/src/app/pattern/**/public-api.ts',
          capture: project,
        },
        {
          type: 'pattern',
          pattern: 'projects/*/src/app/pattern',
          capture: project,
        },
        {
          type: 'domain-routes',
          mode: 'file',
          pattern: 'projects/*/src/app/domains/*/api/*.routes.ts',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-shared',
          pattern: 'projects/*/src/app/domains/*/feat-shared',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-feature',
          pattern: 'projects/*/src/app/domains/*/feat-(*)',
          capture: ['project', 'domain', 'feature'],
        },
        {
          type: 'domain-presentation-api',
          mode: 'file',
          pattern: 'projects/*/src/app/domains/*/presentation/public-api.ts',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-presentation',
          pattern: 'projects/*/src/app/domains/*/presentation',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-infrastructure-api',
          mode: 'file',
          pattern: 'projects/*/src/app/domains/*/infrastructure/public-api.ts',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-infrastructure',
          pattern: 'projects/*/src/app/domains/*/infrastructure',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-application-anti-corruption-layer-api',
          mode: 'file',
          pattern:
            'projects/*/src/app/domains/*/application/anti-corruption-layer.ts',
          capture: project,
        },
        {
          type: 'domain-application-api',
          mode: 'file',
          pattern: 'projects/*/src/app/domains/*/application/public-api.ts',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-application',
          pattern: 'projects/*/src/app/domains/*/application',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-business-api',
          mode: 'file',
          pattern: 'projects/*/src/app/domains/*/domain/public-api.ts',
          capture: ['project', 'domain'],
        },
        {
          type: 'domain-business',
          pattern: 'projects/*/src/app/domains/*/domain',
          capture: ['project', 'domain'],
        },
        {
          type: 'project',
          pattern: 'projects/*',
          capture: project,
        },
        {
          type: 'lib-api',
          mode: 'file',
          pattern: 'libs/*/src/public-api.ts',
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
    rules: {},
  },
];
