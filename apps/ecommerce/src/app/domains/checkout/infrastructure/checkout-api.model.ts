/**
 * Wire/transport types for the **Checkout → POST /orders** integration.
 * No imports from `domain/` — only plain TS interfaces that mirror the API contract.
 */

export interface ShippingAddressWire {
  fullName: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItemWire {
  productItemId: number;
  quantity: number;
}

export interface CreateOrderRequestWire {
  guestEmail?: string;
  shippingAddress: ShippingAddressWire;
  items: OrderItemWire[];
}

export interface PlaceOrderResponseWire {
  orderId: number;
  status: 'confirmed';
  totalAmount: number;
  createdAt: string;
}

/** Snapshot of a single cart line captured at order-submission time. */
export interface ConfirmedOrderItemWire {
  name: string | null;
  quantity: number;
  salePrice: number | null;
  originalPrice: number | null;
}
