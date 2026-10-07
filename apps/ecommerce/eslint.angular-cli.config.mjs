import { resolve } from 'node:path';
import boundaries from 'eslint-plugin-boundaries';
import angular from 'angular-eslint';

/**
 * Angular CLI app boundaries for eslint-plugin-boundaries v7.
 * Compose this after the workspace root config from `ng add angular-eslint`.
 *
 * File barrels that used to be `mode: 'file'` elements are `boundaries/files`
 * categories. Folder elements stay in `boundaries/elements`.
 *
 * @see https://www.jsboundaries.dev/docs/rules/dependencies/
 * @see https://www.jsboundaries.dev/docs/classification/files/
 */
const sameDomain = {
  domain: '{{ from.element.captured.domain }}',
};

const sameFeature = {
  domain: '{{ from.element.captured.domain }}',
  feature: '{{ from.element.captured.feature }}',
};

const sameFileDomain = {
  domain: '{{ from.file.captured.domain }}',
};

const otherFileDomain = {
  domain: '!{{ from.file.captured.domain }}',
};

const project = ['project'];

const coreApi = {
  element: { type: 'core' },
  file: { categories: 'core-api' },
};

const uiApi = {
  element: { type: 'ui' },
  file: { categories: 'ui-api' },
};

const patternApi = {
  element: { type: 'pattern' },
  file: { categories: 'pattern-api' },
};

const libApi = {
  element: { type: 'lib' },
  file: { categories: 'lib-api' },
};

const appFile = { file: { categories: 'app' } };

const domainRoutesFile = { file: { categories: 'domain-routes' } };

const aclFile = {
  file: { categories: 'domain-application-anti-corruption-layer-api' },
};

const sameDomainInfrastructureApi = {
  element: {
    type: 'domain-infrastructure',
    captured: sameDomain,
  },
  file: { categories: 'domain-infrastructure-api' },
};

const sameDomainApplicationApi = {
  element: {
    type: 'domain-application',
    captured: sameDomain,
  },
  file: { categories: 'domain-application-api' },
};

const sameDomainBusinessApi = {
  element: {
    type: 'domain-business',
    captured: sameDomain,
  },
  file: { categories: 'domain-business-api' },
};

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
              from: { file: { categories: 'main' } },
              allow: {
                to: [appFile, { element: { type: 'env' } }],
              },
            },
            {
              from: { element: { type: 'core' } },
              allow: {
                to: [{ element: { type: ['env', 'core'] } }, libApi],
              },
            },
            {
              from: { element: { type: 'ui' } },
              allow: {
                to: [libApi, { element: { type: 'ui' } }],
              },
            },
            {
              from: { element: { type: 'layout' } },
              allow: {
                to: [
                  { element: { type: ['env', 'layout'] } },
                  libApi,
                  coreApi,
                  uiApi,
                  patternApi,
                  domainRoutesFile,
                  aclFile,
                ],
              },
            },
            {
              from: appFile,
              allow: {
                to: [
                  { element: { type: ['themes', 'env', 'layout'] } },
                  appFile,
                  libApi,
                  coreApi,
                  uiApi,
                  domainRoutesFile,
                ],
              },
            },
            {
              from: { element: { type: 'pattern' } },
              allow: {
                to: [
                  { element: { type: 'env' } },
                  libApi,
                  coreApi,
                  uiApi,
                ],
              },
            },
            {
              from: aclFile,
              allow: {
                to: [
                  {
                    element: { type: 'domain-application' },
                    file: { categories: 'domain-application-api' },
                  },
                  aclFile,
                ],
              },
            },
            {
              from: domainRoutesFile,
              allow: {
                to: [
                  { element: { type: 'env' } },
                  libApi,
                  coreApi,
                  patternApi,
                  {
                    file: {
                      categories: 'domain-routes',
                      captured: otherFileDomain,
                    },
                  },
                  {
                    element: {
                      type: 'domain-feature',
                      captured: sameFileDomain,
                    },
                  },
                  {
                    element: {
                      type: 'domain-infrastructure',
                      captured: sameFileDomain,
                    },
                    file: { categories: 'domain-infrastructure-api' },
                  },
                  {
                    element: {
                      type: 'domain-application',
                      captured: sameFileDomain,
                    },
                    file: { categories: 'domain-application-api' },
                  },
                ],
              },
            },
            {
              from: { element: { type: 'domain-infrastructure' } },
              allow: {
                to: [
                  { element: { type: 'env' } },
                  coreApi,
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
                  { element: { type: 'env' } },
                  coreApi,
                  patternApi,
                  uiApi,
                  libApi,
                  {
                    element: {
                      type: 'domain-feature',
                      captured: sameFeature,
                    },
                  },
                  sameDomainApplicationApi,
                  {
                    element: {
                      type: 'domain-shared',
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
                  { element: { type: 'env' } },
                  coreApi,
                  libApi,
                  aclFile,
                  sameDomainInfrastructureApi,
                  {
                    element: {
                      type: 'domain-application',
                      captured: sameDomain,
                    },
                  },
                  sameDomainBusinessApi,
                ],
              },
            },
            {
              from: { element: { type: 'domain-shared' } },
              allow: {
                to: [
                  { element: { type: 'env' } },
                  coreApi,
                  patternApi,
                  uiApi,
                ],
              },
            },
            {
              from: libApi,
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
            {
              // Elements under src/app capture the domain on themselves and the
              // Angular CLI project on their parent. Same-domain infrastructure
              // stays allowed because both sides share that parent project.
              message: 'Projects must not import from other projects',
              disallow: {
                from: {
                  element: {
                    parent: { type: 'project', captured: { project: '*' } },
                  },
                },
                to: {
                  element: {
                    parent: {
                      type: 'project',
                      captured: {
                        project:
                          '!{{ from.element.parents.[0].captured.project }}',
                      },
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
      'boundaries/root-path': resolve(import.meta.dirname),
      'boundaries/files': [
        {
          category: 'main',
          pattern: 'projects/*/src/main.ts',
          capture: ['project'],
        },
        {
          category: 'app',
          pattern:
            'projects/*/src/app/app\\.ts|projects/*/src/app/app[-.].*\\.ts|projects/*/src/app/app.*.ts',
          capture: ['project'],
        },
        {
          category: 'core-api',
          pattern: 'projects/*/src/app/core/**/public-api.ts',
          capture: ['project'],
        },
        {
          category: 'ui-api',
          pattern: 'projects/*/src/app/ui/**/public-api.ts',
          capture: ['project'],
        },
        {
          category: 'pattern-api',
          pattern: 'projects/*/src/app/pattern/**/public-api.ts',
          capture: ['project'],
        },
        {
          category: 'domain-routes',
          pattern: 'projects/*/src/app/domains/*/api/*.routes.ts',
          capture: ['project', 'domain'],
        },
        {
          category: 'domain-presentation-api',
          pattern: 'projects/*/src/app/domains/*/presentation/public-api.ts',
          capture: ['project', 'domain'],
        },
        {
          category: 'domain-infrastructure-api',
          pattern: 'projects/*/src/app/domains/*/infrastructure/public-api.ts',
          capture: ['project', 'domain'],
        },
        {
          category: 'domain-application-anti-corruption-layer-api',
          pattern:
            'projects/*/src/app/domains/*/application/anti-corruption-layer.ts',
          capture: ['project', 'domain'],
        },
        {
          category: 'domain-application-api',
          pattern: 'projects/*/src/app/domains/*/application/public-api.ts',
          capture: ['project', 'domain'],
        },
        {
          category: 'domain-business-api',
          pattern: 'projects/*/src/app/domains/*/domain/public-api.ts',
          capture: ['project', 'domain'],
        },
        {
          category: 'lib-api',
          pattern: 'libs/*/src/public-api.ts',
          capture: ['lib'],
        },
      ],
      'boundaries/elements': [
        {
          type: 'env',
          pattern: 'projects/*/src/environments',
          capture: project,
        },
        {
          type: 'themes',
          pattern: 'src/app/themes',
        },
        {
          type: 'core',
          pattern: 'src/app/core',
        },
        {
          type: 'ui',
          pattern: 'src/app/ui',
        },
        {
          type: 'layout',
          pattern: 'src/app/layout',
        },
        {
          type: 'pattern',
          pattern: 'src/app/pattern',
        },
        {
          type: 'domain-shared',
          pattern: 'src/app/domains/*/feat-shared',
          capture: ['domain'],
        },
        {
          type: 'domain-feature',
          pattern: 'src/app/domains/*/feat-(*)',
          capture: ['domain', 'feature'],
        },
        {
          type: 'domain-presentation',
          pattern: 'src/app/domains/*/presentation',
          capture: ['domain'],
        },
        {
          type: 'domain-infrastructure',
          pattern: 'src/app/domains/*/infrastructure',
          capture: ['domain'],
        },
        {
          type: 'domain-application',
          pattern: 'src/app/domains/*/application',
          capture: ['domain'],
        },
        {
          type: 'domain-business',
          pattern: 'src/app/domains/*/domain',
          capture: ['domain'],
        },
        {
          // Parent layer of every element under projects/<name>/src/app.
          // Slice patterns start at src/app so this folder stays outside them.
          type: 'project',
          pattern: 'projects/*',
          capture: project,
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
