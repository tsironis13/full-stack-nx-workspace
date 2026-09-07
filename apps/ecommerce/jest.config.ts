// eslint-disable-next-line boundaries/no-unknown-files
export default {
  displayName: 'ecommerce',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/ecommerce',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleNameMapper: {
    '^@copilotkit/a2ui-renderer(/.*)?$':
      '<rootDir>/src/test-mocks/copilotkit-a2ui-renderer.js',
    '^@copilotkit/web-components(/.*)?$':
      '<rootDir>/src/test-mocks/copilotkit-a2ui-renderer.js',
    '^@a2ui/angular(/.*)?$': '<rootDir>/src/test-mocks/a2ui-angular.js',
    '^@a2ui/web_core(/.*)?$': '<rootDir>/src/test-mocks/a2ui-angular.js',
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
