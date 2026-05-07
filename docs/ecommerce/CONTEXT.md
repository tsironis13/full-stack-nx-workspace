# E-commerce Platform

A platform for managing products, purchasable product items, categories, pricing, carts, orders, and the customer purchase lifecycle.

---

# Language

# Product catalog

## Product

The primary catalog entity representing shared product information and marketing content. Stored in the `products` table.

A Product is not directly purchasable; purchasable behavior belongs to Product Items.

Avoid:

- Item
- SKU
- Variant Product

---

## Product Item

A purchasable variation or concrete sellable unit belonging to a Product. Stored in the `product_items` table.

Contains pricing and business identifiers.

Avoid:

- Variant
- SKU Item
- Inventory Item

---

## Main Product Item

The default Product Item for a Product, identified by `is_main_product = true`.

Used for:

- Product listings
- Search results
- Default pricing display

Avoid:

- Primary Variant
- Featured SKU

---

## Category

A classification entity used to organize Products within the catalog hierarchy.

Stored in the `categories` table.

A Category may contain subcategories and Products.

Avoid:

- Collection
- Department
- Folder

---

## Parent Category

A Category that contains child Categories.

Used for hierarchical navigation and storefront organization.

Examples:

- Electronics
  - Smartphones
  - Laptops

Avoid:

- Root Group
- Super Category

---

## Root Category

A top-level Category with no parent Category.

Used as the primary storefront navigation layer.

Avoid:

- Main Department
- Primary Folder

---

## Child Category

A Category nested under another Category.

Avoid:

- Nested Group
- Sub Folder

---

# Users and accounts

## User

A person who interacts with the platform.

Stored in the `users` table.

A User may:

- Browse products
- Manage carts
- Place orders
- Maintain addresses
- Manage wishlists

Avoid:

- Client
- Consumer
- Account Holder

---

## Guest User

A non-authenticated visitor interacting with the storefront.

May:

- Browse products
- Add items to cart

Cannot:

- Access account history
- Manage saved addresses
- View orders

Avoid:

- Anonymous Customer
- Temporary User

---

## Registered User

An authenticated User with persisted account data.

May:

- Place orders
- View order history
- Save addresses
- Manage profile information

Avoid:

- Member
- Signed User

---

## Admin User

A privileged User responsible for platform management.

May:

- Manage products
- Manage categories
- Manage orders
- Manage inventory

Avoid:

- Super User
- Backoffice User

---

## Customer Account

The persisted profile and commerce identity associated with a Registered User.

Contains:

- Personal information
- Addresses
- Order history
- Preferences

Avoid:

- Membership
- Profile Account

---

## Address

A physical location associated with a User or Order.

Types:

- Shipping Address
- Billing Address

Avoid:

- Location
- Destination

---

## Shipping Address

The Address used for order delivery.

Avoid:

- Delivery Address

---

## Billing Address

The Address associated with payment or invoicing.

Avoid:

- Payment Address

---

# Product content

## Product Description

The main customer-facing explanation of a Product, stored in `description`.

Avoid:

- Summary
- Product Copy

---

## About Content

Extended marketing or informational content stored in `about`.

Typically used for:

- Storytelling
- Brand messaging
- Product highlights

Avoid:

- Metadata
- Notes

---

## Care Instructions

Maintenance or usage instructions for a Product, stored in `care_instructions`.

Examples:

- Washing instructions
- Material care
- Cleaning guidance

Avoid:

- Warnings
- Specs

---

# Pricing

## Original Price

The base non-discounted price of a Product Item.

Mapped to:

- `product_items.original_price`

Avoid:

- Old Price
- MSRP (unless explicitly modeled)

---

## Sale Price

The active customer-facing selling price of a Product Item.

Mapped to:

- `product_items.sale_price`

Avoid:

- Discount Price
- Final Price

---

## Discounted Product Item

A Product Item where:
`sale_price < original_price`

Avoid:

- Offer Product
- Promotion Product

---

# Product identity

## Product Code

The business identifier for a Product Item.

Mapped to:

- `product_items.product_code`

Used for:

- Operations
- Integrations
- Search
- Order references

Avoid:

- ID
- Internal Key
- SKU (unless standardized everywhere)

---

# Shopping lifecycle

## Cart

A temporary collection of Product Items a customer intends to purchase.

A Cart belongs to either:

- A Guest User session
- A Registered User

Avoid:

- Basket
- Checkout Bag

---

## Cart Item

A Product Item entry inside a Cart with quantity information.

Avoid:

- Line
- Basket Item

---

## Wishlist

A saved collection of Products or Product Items a User intends to revisit later.

Belongs to a Registered User.

Avoid:

- Favorites
- Saved Items

---

## Checkout

The flow that converts a Cart into an Order.

Includes:

- Address selection
- Payment
- Order confirmation

Avoid:

- Purchase Flow
- Payment Flow

---

## Order

An immutable customer purchase created from Checkout.

Contains snapshots of:

- Product information
- Pricing
- Quantities

Belongs to a User.

Avoid:

- Purchase
- Transaction

---

## Order Item

A snapshot of a Product Item at purchase time.

Stores:

- Purchased price
- Product name
- Quantity

Avoid:

- Purchased Variant
- Line Item Snapshot

---

## Payment

A financial transaction associated with an Order.

Avoid:

- Billing Transaction
- Charge

---

## Shipment

The delivery lifecycle of an Order.

Avoid:

- Delivery Package
- Fulfillment Unit

---

# Inventory

## Inventory

The available stock quantity for a Product Item.

Avoid:

- Availability
- Warehouse State

---

## In Stock Product Item

A Product Item with available inventory greater than zero.

Avoid:

- Available Product
- Active Inventory

---

## Out of Stock Product Item

A Product Item with zero available inventory.

Avoid:

- Unavailable Product
- Sold Out Variant

---

# Product lifecycle

## Active Product

A Product visible and purchasable in the storefront.

Avoid:

- Enabled Product
- Live Product

---

## Archived Product

A Product hidden from storefront visibility while retained in the database.

Avoid:

- Deleted Product
- Removed Product

---

# Relationships

- A Category may contain child Categories
- A Category contains many Products
- A Product belongs to exactly one Category
- A Product contains one or more Product Items
- A Product Item belongs to exactly one Product
- A Product should contain exactly one Main Product Item
- A User may own one active Cart
- A Cart contains Cart Items
- A Cart Item references a Product Item
- A User may maintain multiple Addresses
- A Registered User may maintain a Wishlist
- Checkout converts a Cart into an Order
- An Order belongs to a User
- An Order contains Order Items
- An Order Item stores a snapshot of Product Item pricing and metadata
- A Shipment belongs to an Order
- A Payment belongs to an Order

---

# Business rules

## Category rules

- Categories may be hierarchical
- Root Categories have no parent
- Child Categories belong to exactly one parent Category
- Products may only belong to one Category unless explicitly modeled otherwise

---

## User rules

- A Guest User may create a temporary Cart
- A Registered User may persist Cart state across sessions
- Orders must belong to a Registered User or persisted guest checkout identity
- Admin Users may access management functionality unavailable to storefront Users

---

## Product rules

- A Product must belong to a Category
- A Product should contain at least one Product Item
- A Product should only have one Main Product Item

---

## Product Item rules

- A Product Item belongs to exactly one Product
- Product Code should be unique
- Sale Price cannot be negative
- Original Price cannot be negative
- Sale Price may equal Original Price
- A Product Item is considered discounted when Sale Price is lower than Original Price

---

## Cart rules

- A Cart must contain at least one Cart Item before Checkout
- Cart Item quantity must be greater than zero

---

## Order rules

- Orders are immutable after creation
- Order totals are calculated from Order Items
- Order Items preserve historical pricing even if Product pricing changes later

---

# Aggregate boundaries

## Product Aggregate

### Root

- Product

### Contains

- Product Items

### Responsibilities

- Product metadata
- Product content
- Product pricing structure
- Product item ownership

---

## Category Aggregate

### Root

- Category

### Contains

- Child Categories

### Responsibilities

- Catalog hierarchy
- Product organization
- Storefront navigation

---

## User Aggregate

### Root

- User

### Contains

- Addresses
- Wishlist
- Cart

### Responsibilities

- Customer identity
- Purchase ownership
- Account preferences

---

## Order Aggregate

### Root

- Order

### Contains

- Order Items
- Payment
- Shipment

### Responsibilities

- Purchase history
- Pricing snapshots
- Order lifecycle

---

# Example dialogue

Dev:
"Can a Product belong to multiple Categories?"

Domain expert:
"No. Products belong to exactly one Category unless we explicitly introduce multi-category support later."

---

Dev:
"What's the difference between a Product and a Product Item?"

Domain expert:
"The Product contains shared marketing and catalog information. Product Items are the actual purchasable entities with pricing and product codes."

---

Dev:
"Can Guest Users place orders?"

Domain expert:
"Yes, but they don't have a persisted Customer Account unless they register."

---

Dev:
"What happens if pricing changes after an order is placed?"

Domain expert:
"Order Items store snapshots of the purchased pricing. Orders never recalculate from current Product Item prices."

---

Dev:
"Can we have multiple default Product Items?"

Domain expert:
"No. A Product should only have one Main Product Item."

---

# Flagged ambiguities

## "Product" vs "Product Item"

The Product is the catalog-level entity containing shared content.
The Product Item is the purchasable entity containing pricing and business identifiers.

These terms should never be used interchangeably.

---

## "Category" vs "Collection"

Category is a navigational and organizational catalog structure.
Collection typically implies a curated merchandising grouping.

Do not use them interchangeably.

---

## "User" vs "Customer"

User is the broader system identity.
Customer refers specifically to commerce behavior such as purchasing.

An Admin User is a User but not a Customer.

---

## "Product Code" vs "ID"

`id` is the internal database identifier.
`product_code` is the business-facing identifier.

Avoid calling both "product ID".

---

## "Sale Price" vs "Discount"

Sale Price is the actual stored selling price.
Discount is derived behavior:
`original_price - sale_price`

They are not interchangeable.

---

## "Archived" vs "Deleted"

Archived means hidden from active storefront views but retained in the database.
Deleted means permanently removed.

These represent different lifecycle states and should not share UI labels.
