export { CatalogBrowseStore } from './catalog-browse.store';
export type {
  AttributeFacet,
  AttributeFacetValue,
  CatalogListItem,
  CatalogListResponse,
  CatalogSort,
} from '../domain/public-api';
export {
  catalogCardRatingAriaLabel,
  formatAverageRatingForDisplay,
} from '../domain/public-api';

/**
 * Cart ACL surface re-exported here so **catalog feature** components can import
 * cart events and the read adapter via their own `domain-application-api` barrel
 * (ESLint: `domain-feature` may not import `domain-application-anti-corruption-layer-api` directly).
 */
export { CartAclReadAdapter, cartCatalogEvents } from '../../cart/application/anti-corruption-layer';
