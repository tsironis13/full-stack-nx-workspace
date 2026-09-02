/**
 * Webpack entry for the product-embeddings CLI (`presentation/cli/run.ts`).
 * Output: dist/apps/ecommerce-api-cli/main.js
 */
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/ecommerce-api-cli'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/modules/product-embeddings/presentation/cli/run.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
    }),
  ],
};
