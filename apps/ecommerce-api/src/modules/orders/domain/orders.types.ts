export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  productItemId: number;
  productName: string | null;
  productCode: string | null;
  salePrice: number;
  originalPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  userId: string | null;
  guestEmail: string | null;
  status: string;
  shippingAddress: ShippingAddress;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date | null;
  items: OrderItem[];
}
