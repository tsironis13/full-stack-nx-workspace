import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'lib',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'lib',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Pre-existing app- selectors stay until later kit/assistant tickets.
    files: [
      '**/ui-kit/card/**/*.ts',
      '**/ui-kit/image/**/*.ts',
      '**/ui-kit/paginator/**/*.ts',
      '**/ui-assistant/**/*.ts',
      '**/util-copilotkit/**/*.ts',
    ],
    rules: {
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/component-selector': 'off',
    },
  },
];
