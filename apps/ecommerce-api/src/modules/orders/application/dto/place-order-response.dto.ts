export interface PlaceOrderResponseDto {
  orderId: number;
  status: 'confirmed';
  totalAmount: number;
  createdAt: string;
}
