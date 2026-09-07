/** Jest stub for `@a2ui/angular` so unit tests do not load ESM `web_core`. */
class A2uiRendererService {}
class SurfaceComponent {}

module.exports = {
  A2uiRendererService,
  SurfaceComponent,
  provideA2uiCatalog: () => [],
  provideMarkdownRenderer: () => [],
};
