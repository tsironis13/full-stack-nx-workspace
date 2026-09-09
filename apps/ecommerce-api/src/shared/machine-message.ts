import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

export const MachineMessageCode = {
  cartQuantityMin: 'cart.quantity.min',
  cartItemNotFound: 'cart.item.notFound',
  productItemNotFound: 'productItem.notFound',
  ordersIdentityMissing: 'orders.identity.missing',
  ordersIdentityConflict: 'orders.identity.conflict',
  reviewsRatingInvalid: 'reviews.rating.invalid',
  reviewsNotFound: 'reviews.notFound',
  reviewsProductNotFound: 'reviews.product.notFound',
  reviewsVerifiedPurchaseRequired: 'reviews.verifiedPurchase.required',
  reviewsAlreadyExists: 'reviews.alreadyExists',
  catalogCategoryRootInvalid: 'catalog.categoryRoot.invalid',
  catalogMinRatingInvalid: 'catalog.minRating.invalid',
  catalogPriceRange: 'catalog.price.range',
  catalogPriceNotFinite: 'catalog.price.notFinite',
  catalogPriceNegative: 'catalog.price.negative',
  catalogAttributeFilterFormat: 'catalog.attributeFilter.format',
  catalogAttributeFilterAttributeId: 'catalog.attributeFilter.attributeId',
  catalogAttributeFilterValueId: 'catalog.attributeFilter.valueId',
  searchQueryEmpty: 'search.query.empty',
} as const;

export type MachineMessageParams = Record<string, string | number>;

type MachineMessageBody = {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  params?: MachineMessageParams;
};

function body(
  statusCode: number,
  error: string,
  code: string,
  message: string,
  params?: MachineMessageParams,
): MachineMessageBody {
  if (params && Object.keys(params).length > 0) {
    return { statusCode, error, code, message, params };
  }
  return { statusCode, error, code, message };
}

export function codedBadRequest(
  code: string,
  message: string,
  params?: MachineMessageParams,
): BadRequestException {
  return new BadRequestException(
    body(HttpStatus.BAD_REQUEST, 'Bad Request', code, message, params),
  );
}

export function codedNotFound(
  code: string,
  message: string,
  params?: MachineMessageParams,
): NotFoundException {
  return new NotFoundException(
    body(HttpStatus.NOT_FOUND, 'Not Found', code, message, params),
  );
}

export function codedForbidden(
  code: string,
  message: string,
  params?: MachineMessageParams,
): ForbiddenException {
  return new ForbiddenException(
    body(HttpStatus.FORBIDDEN, 'Forbidden', code, message, params),
  );
}

export function codedConflict(
  code: string,
  message: string,
  params?: MachineMessageParams,
): ConflictException {
  return new ConflictException(
    body(HttpStatus.CONFLICT, 'Conflict', code, message, params),
  );
}
