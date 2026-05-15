import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';

import { DrizzleService } from '../../../drizzle/drizzle.service';
import { carts } from '../../../db/schema/carts';
import { cartItems } from '../../../db/schema/cart-items';
import { productItems } from '../../../db/schema/product-items';
import { CartRepository } from '../domain/repositories/cart.repository';
import { Cart } from '../domain/cart.types';

@Injectable()
export class DrizzleCartRepository implements CartRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async getCartByUserId(userId: string): Promise<Cart> {
    const cart = await this.ensureCart(userId);
    return this.enrichCart(cart.id, userId);
  }

  async addItem(params: {
    userId: string;
    productItemId: number;
    quantity: number;
    capturedSalePrice: number;
    capturedName: string;
    capturedImageUrl: string | null;
  }): Promise<Cart> {
    const cart = await this.ensureCart(params.userId);

    const [existing] = await this.drizzle.db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productItemId, params.productItemId),
        ),
      );

    if (existing) {
      await this.drizzle.db
        .update(cartItems)
        .set({
          quantity: existing.quantity + params.quantity,
          capturedSalePrice: params.capturedSalePrice,
          capturedName: params.capturedName,
          capturedImageUrl: params.capturedImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existing.id));
    } else {
      await this.drizzle.db.insert(cartItems).values({
        cartId: cart.id,
        productItemId: params.productItemId,
        quantity: params.quantity,
        capturedSalePrice: params.capturedSalePrice,
        capturedName: params.capturedName,
        capturedImageUrl: params.capturedImageUrl,
      });
    }

    await this.drizzle.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return this.enrichCart(cart.id, params.userId);
  }

  async updateItemQuantity(params: {
    userId: string;
    cartItemId: number;
    quantity: number;
  }): Promise<Cart> {
    const cart = await this.ensureCart(params.userId);

    const [item] = await this.drizzle.db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.id, params.cartItemId), eq(cartItems.cartId, cart.id)),
      );

    if (!item) {
      throw new NotFoundException(`Cart item ${params.cartItemId} not found`);
    }

    await this.drizzle.db
      .update(cartItems)
      .set({ quantity: params.quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, params.cartItemId));

    await this.drizzle.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return this.enrichCart(cart.id, params.userId);
  }

  async removeItem(params: {
    userId: string;
    cartItemId: number;
  }): Promise<Cart> {
    const cart = await this.ensureCart(params.userId);

    const [item] = await this.drizzle.db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.id, params.cartItemId), eq(cartItems.cartId, cart.id)),
      );

    if (!item) {
      throw new NotFoundException(`Cart item ${params.cartItemId} not found`);
    }

    await this.drizzle.db
      .delete(cartItems)
      .where(eq(cartItems.id, params.cartItemId));

    await this.drizzle.db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return this.enrichCart(cart.id, params.userId);
  }

  async mergeItems(params: {
    userId: string;
    items: Array<{
      productItemId: number;
      quantity: number;
      capturedSalePrice: number;
      capturedName: string;
      capturedImageUrl?: string | null;
    }>;
  }): Promise<Cart> {
    const cart = await this.ensureCart(params.userId);

    for (const item of params.items) {
      const [existing] = await this.drizzle.db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cart.id),
            eq(cartItems.productItemId, item.productItemId),
          ),
        );

      if (existing) {
        await this.drizzle.db
          .update(cartItems)
          .set({
            quantity: existing.quantity + item.quantity,
            capturedSalePrice: item.capturedSalePrice,
            capturedName: item.capturedName,
            capturedImageUrl: item.capturedImageUrl ?? null,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existing.id));
      } else {
        await this.drizzle.db.insert(cartItems).values({
          cartId: cart.id,
          productItemId: item.productItemId,
          quantity: item.quantity,
          capturedSalePrice: item.capturedSalePrice,
          capturedName: item.capturedName,
          capturedImageUrl: item.capturedImageUrl ?? null,
        });
      }
    }

    if (params.items.length > 0) {
      await this.drizzle.db
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id));
    }

    return this.enrichCart(cart.id, params.userId);
  }

  async clearItemsByUserId(userId: string): Promise<void> {
    const [cart] = await this.drizzle.db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!cart) {
      return;
    }

    await this.drizzle.db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cart.id));
  }

  private async ensureCart(userId: string): Promise<{ id: number }> {
    const [existing] = await this.drizzle.db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, userId));

    if (existing) {
      return existing;
    }

    const [inserted] = await this.drizzle.db
      .insert(carts)
      .values({ userId })
      .returning({ id: carts.id });

    return inserted;
  }

  private async enrichCart(cartId: number, userId: string): Promise<Cart> {
    const rows = await this.drizzle.db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productItemId: cartItems.productItemId,
        quantity: cartItems.quantity,
        capturedSalePrice: cartItems.capturedSalePrice,
        capturedName: cartItems.capturedName,
        capturedImageUrl: cartItems.capturedImageUrl,
        currentPrice: productItems.salePrice,
        deletedAt: productItems.deletedAt,
      })
      .from(cartItems)
      .leftJoin(productItems, eq(cartItems.productItemId, productItems.id))
      .where(eq(cartItems.cartId, cartId));

    return {
      id: cartId,
      userId,
      items: rows.map((r) => ({
        id: r.id,
        cartId: r.cartId,
        productItemId: r.productItemId,
        quantity: r.quantity,
        capturedPrice: r.capturedSalePrice,
        capturedName: r.capturedName,
        capturedImageUrl: r.capturedImageUrl,
        currentPrice: r.currentPrice ?? r.capturedSalePrice,
        available: r.deletedAt === null,
      })),
    };
  }
}
