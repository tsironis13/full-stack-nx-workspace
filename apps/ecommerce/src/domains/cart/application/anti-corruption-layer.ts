/** Anti Corruption Layer for the cart domain
 * It is the external interface for the cart domain, not the internal interface for the cart domain
 * Exposes stuff that are needed by other domains like the products domain
 * Domains can communicate with each other only through the anti-corruption layer
 */
export { addItemToCart, removeItemFromCart } from './events';
export { CartUiAdapter } from './cart-ui.adapter';
