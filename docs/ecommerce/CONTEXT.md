# E-commerce Platform

A platform for managing products, purchasable product items, categories, pricing, carts, orders, and the customer purchase lifecycle.

---

# Language

# Product catalog

## Product

The primary catalog entity representing shared product information and marketing content. Stored in the `products` table.

A Product is not directly purchasable; purchasable behavior belongs to Product Items.

**Storefront catalog search (v1):** Text search matches **`products.name`** only. Need-language discovery is the **Shopping Assistant**, not this search box.

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

On the storefront, describe purchasable differences using **options** (for example color and size), or neutral phrases such as **more options**; do not use *variant* in customer-facing wording.

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

## Rating

The numeric star score (1–5) on a **Review** of a **Product**.

Not a separate submission type — shoppers submit **Reviews**; the star value is the **Rating**. A **Product**'s public score is the exact average **Rating** across its non-deleted **Reviews**, together with a **review count**. **Highest rated** sort and the **Rating** filter use the exact average; the storefront displays the average rounded to one decimal (for example 3.666… shown as **3.7★**). Shown on the product detail page and catalog listing cards when the **Product** has at least one **Review**.

Avoid:

- SKU rating
- Item rating
- Variant rating
- Standalone rating (without a **Review** record)

---

## Review

A shopper's evaluation of a **Product**: a required **Rating** (1–5 stars) and optional written content (title and/or body).

Belongs to exactly one **Product** and one **Registered User** (the author). A **Registered User** may author at most one **Review** per **Product**; they may **edit** or **delete** (soft delete) that **Review** after submission. An **Admin User** may **hide** any **Review** from the storefront — same outcome as author soft delete: hidden from shoppers, excluded from the **Product** aggregate, retained in the database. Only **Registered Users** with a **verified purchase** of that **Product** may submit a **Review**; **Guest Users** cannot, even if they placed an **Order** via **Guest Checkout Identity**.

Text is optional — a **Review** with stars only still counts toward the **Product** aggregate and may appear in the review list without written content.

On the storefront review list, the author is shown as **first name + last initial** (for example “Kate R.”), **snapshotted** on the **Review** at submit or edit time. If no usable name was available at snapshot time, show **Verified buyer**. Profile renames do not retroactively change existing **Reviews** unless the author **edits** the **Review** (which refreshes the snapshot).

Eligible **Registered Users** may submit, **edit**, or **delete** a **Review** from the **Product** detail page and from **order history** (for example “Write a review” / “Edit review” on eligible **Products** from **`confirmed`** **Orders**). Both entry points operate on the same **Review** record.

Avoid:

- Feedback
- Comment
- Testimonial (unless editorial — see future editorial sources)

---

## Verified purchase

Proof that a **Registered User** bought a **Product**, derived from **Order** history.

A **verified purchase** exists when the user has at least one **Order** in **`confirmed`** status containing an **Order Item** whose **Product Item** belongs to the target **Product**. **Orders** in **`pending`** or **`cancelled`** status do not qualify.

Avoid:

- Verified buyer badge (UI label — not a separate domain entity)
- Purchase verification (generic — use **Verified purchase**)

---

## Storefront catalog sort (v1)

- **Newest:** By **`products.created_at`** (newest first uses descending order).
- **Price (low to high / high to low):** By **Sale Price** on the **Main Product Item** for each **Product**, consistent with listing display.
- **Highest rated:** By exact average **Rating** across non-deleted **Reviews** for each **Product** (descending). **Products** with no **Reviews** appear after all rated **Products** (tie-break among unrated — for example by **`products.created_at`**).
- **Not offered:** **Most popular** — deferred until the domain defines a measurable popularity signal.

---

## Storefront catalog rating display (v1)

Catalog listing cards and the product detail page show average **Rating** (one decimal, rounded for display) and **review count** when the **Product** has at least one non-deleted **Review**. **Products** with no **Reviews** show no star score on listing cards; the product detail page may show neutral copy such as “No reviews yet” instead of a numeric average.

---

## Storefront catalog rating filter (v1)

Shoppers may filter to **Products** whose exact average **Rating** is at or above a selected threshold (for example 4★ and up — a **Product** averaging 3.8 does not match). **Products** with no **Reviews** do not match any minimum-**Rating** filter.

---

## Storefront catalog price filter (v1)

**Price range** compares against **Sale Price** on the **Main Product Item** only—the same basis as listing cards and catalog sort. Pricing on other **Product Items** does not determine whether the **Product** matches the range.

---

## Storefront catalog attribute filters (v1)

Facets such as size and color use the **attribute** data tied to **Product Items** (and category–attribute rules where the schema defines them). Options are **dynamic**: the storefront offers values that still occur on **Product Items** belonging to the **current** filtered **Product** result set—no fixed hardcoded lists for those dimensions in the UI.

---

## Storefront catalog URL state (v1)

Search text, facet selection, sort, and pagination are **not** required to serialize to the URL. Refreshing or sharing a generic catalog URL does not need to restore the same result set for v1.

---

# Shopping Assistant

## Shopping Assistant

A storefront chat that recommends **Products** from a stated **product need**.

v1 recommends only: ranked **Products** as in-chat **Product recommendation** cards (at most three per turn), plus a one-line why grounded in the retrieval fields. It does not add to the **Cart**, change catalog filters, pick a **Product Item**, or answer account/order questions.

Avoid:

- Catalog search (the **Storefront catalog search** `q` parameter)
- Semantic search (implementation)
- Sales chatbot / copilot (generic)

---

## Product need

A shopper's use, constraint, or kind of **Product**, in natural language (for example “waterproof shoes for hiking”).

Not a **Product** name keyword and not a catalog facet selection.

Avoid:

- Search string
- Keywords
- Intent (unless you mean this)

---

## Product recommendation

A **Product** suggested for a **product need**, with a reason that may cite only: **Product** name, **Category** path, **Sale Price** on the **Main Product Item**, a short description/about excerpt, and **options** (attribute values on **Product Items**).

The unit is **Product**, never **Product Item**. Similarity scores are internal ranking, not shopper copy. v1 shows at most three **Product recommendations** per turn.

Avoid:

- Search hit (technical)
- SKU suggestion
- Variant recommendation

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

On the storefront catalog, a category facet may list **Root Categories** only. Selecting a Root Category includes **Products** in that Category and in any **Child Category** beneath it (subtree inclusion), until the shopper refines to a specific nested **Category** if that interaction exists.

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
- Hide **Reviews** from the storefront (**business-portal**)

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

On the storefront catalog, adding to the **Cart** from a product listing or grid uses the **Main Product Item** by default—the same unit used for the listing’s price and primary image. The product detail flow may allow choosing a different **Product Item** before adding.

A **Product** may surface that other **Product Items** exist (e.g. more sizes or colours); that does **not** block add-to-cart from the grid—the **Main Product Item** is still the default unit for that action.

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

On the storefront, Guest Users may see wishlist controls; persisting selections requires completing sign-in or registration first.

Adding from a product listing or catalog grid saves the **Main Product Item** by default—the same unit used for the listing’s price and primary image. The product detail flow may allow choosing a different **Product Item** before adding.

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

**Checkout (v1):** A single-page flow. All inputs (Shipping Address, payment details, order summary) appear on one page. Available to both Guest Users and Registered Users. Navigating to `/checkout` requires a non-empty Cart.

Avoid:

- Purchase Flow
- Payment Flow

---

## Guest Checkout Identity

The minimal identity used when a Guest User places an Order: an email address entered at checkout time.

No Customer Account is created. The Order is stored against the email alone. The Guest User cannot view the Order after leaving the confirmation screen unless account creation is added later.

Avoid:

- Anonymous Checkout
- Temporary Account

---

## Order

An immutable customer purchase created from Checkout.

Contains snapshots of:

- Product information
- Pricing
- Quantities

Belongs to either a Registered User (identified by `user_id`) or a Guest Checkout Identity (identified by `guest_email`). Exactly one of these must be present.

**Order Status (v1):** `pending` → `confirmed` → `cancelled`.

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

**Payment Status (v1):** `pending` only — payment processing is mocked. Real gateway integration is deferred.

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
- A **Product recommendation** refers to a **Product**, not a **Product Item**
- A Product may have many **Reviews**
- A **Review** belongs to exactly one **Product**
- A **Review** belongs to exactly one **Registered User**
- A **Review** includes exactly one **Rating** (star score)
- At most one **Review** per **Registered User** per **Product**
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
- A **Guest User** **Cart** and a signed-in **Registered User** **Cart** do not share contents under those two modes of browsing; when the shopper completes sign-in, **Cart Items** from the guest **Cart** **merge** into that **Registered User**'s **Cart** using the same behavior as adding the same **Product Item** again from the storefront (one line per **Product Item**, quantities combined; indicative presentation per **Cart rules**), after which the guest **Cart** is cleared
- A Guest User may place an Order using a Guest Checkout Identity (email-only); no account is created
- Orders must belong to a Registered User or a Guest Checkout Identity
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
- Lowering quantity past one removes the **Cart Item**—the storefront does not retain zero-quantity lines
- When adding the same **Product Item** again merges quantities into one **Cart Item**, indicative presentation for that line (including captured price and primary image shown in the **Cart**) **refreshes** from that add—the latest storefront interaction replaces the older snapshot on that row
- Amounts shown for **Cart Items** in the storefront reflect the last captured offer for each line until **Checkout**; totals become authoritative only when **Checkout** establishes the **Order**
- A **Cart Item** whose **Product Item** has been archived is flagged **unavailable** — it is returned in the Cart response but blocks **Checkout** until removed; it is never silently dropped
- When the **Sale Price** of a **Product Item** changes after it was added, both the stored **captured price** and the live **current price** are returned in the Cart response; the storefront may surface a price-changed indicator but the **captured price** is display-only — **Checkout** always reads the authoritative price from the database
- On logout, the guest Cart is reset to empty; items from a **Registered User** session do not carry over to a subsequent anonymous session

---

## Order rules

- Orders are immutable after creation
- Order totals are calculated from Order Items
- Order Items preserve historical pricing even if Product pricing changes later
- An Order must belong to exactly one of: a Registered User (`user_id`) or a Guest Checkout Identity (`guest_email`); never both, never neither
- Order Item prices are always read from the database at the moment of Order creation — client-submitted prices are never trusted
- A successful Order creation clears the Cart for the placing User

---

## Review rules

- Only a **Registered User** may author a **Review**
- A **Registered User** may submit a **Review** for a **Product** only when they have a **verified purchase** of that **Product**
- At most one **Review** per **Registered User** per **Product**
- The author may **edit** their **Review** after submission; the **Product** aggregate reflects the latest **Rating**
- The author may **delete** their **Review** (soft delete) — it is hidden from the storefront, excluded from the **Product** aggregate, and retained in the database
- An **Admin User** may **hide** any **Review** from the storefront — same effect as author soft delete; the author cannot restore an admin-hidden **Review**
- A **Review** with stars only appears in the product review list (stars, author, date); written content is omitted when absent
- Public author display: **first name + last initial**, snapshotted at submit or edit; **Verified buyer** when no usable name was available at snapshot time
- **Review** submission and edit are available from the **Product** detail page and from **order history** for eligible **Registered Users**
- **Orders** in **`pending`** or **`cancelled`** status do not establish a **verified purchase**
- **Guest Users** may not submit **Reviews**, even when they placed an **Order** as a guest

---

## Shopping Assistant rules (v1)

- The **Shopping Assistant** searches only when the message is a **product need**
- Follow-up refinements reconstruct the **product need** and search again; references like “the second one” mean the last **Product recommendations**, not a new ranking
- Weak matches may be declined; the assistant then asks one narrowing question instead of padding with poor **Products**
- Reply in the shopper's language; do not translate **Product** names, **options**, or **Category** path
- **Storefront catalog search** remains **`products.name`** only — the assistant is not the catalog `q` parameter
- **Guest Users** and **Registered Users** may use the assistant; v1 does not bind conversation memory to a **Customer Account**

---

## Data rules

- **Shopping Assistant** instructions describe when to retrieve **Products** for a **product need**; they do not name tools. The model selects a tool only when the shopper's request matches that tool's description. If no description matches, it does not call a tool.
- A **Product recommendation** may cite only fields returned for that recommendation. The assistant must not invent a **Product**, specs, stock, or **Ratings**.

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

Dev:
"Is the Shopping Assistant just catalog search in a chat bubble?"

Domain expert:
"No. Catalog search matches Product names. The Shopping Assistant takes a product need and returns Product recommendations with a grounded why."

---

Dev:
"Should it recommend a size or color?"

Domain expert:
"Not in v1. It recommends the Product. Options on the recommendation are for explaining the fit, not for picking a Product Item."

---

# Flagged ambiguities

## "Product" vs "Product Item"

The Product is the catalog-level entity containing shared content.
The Product Item is the purchasable entity containing pricing and business identifiers.

These terms should never be used interchangeably. A **Product recommendation** is always a **Product**.

---

## "Storefront catalog search" vs "Shopping Assistant"

**Storefront catalog search** is name match on **`products.name`**, combined with catalog facets.
The **Shopping Assistant** ranks **Products** for a **product need**. They are different entry points and must not share the catalog `q` contract. Decision record: [0005-shopping-assistant-retrieval-not-catalog-search](./adr/0005-shopping-assistant-retrieval-not-catalog-search.md).

---

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

---

## Product rating (storefront catalog v1)

**Resolved (2026):** Product-level **Reviews** and **Ratings** are in scope for the storefront and catalog. See **Rating**, **Review**, **Verified purchase**, storefront catalog **rating display / filter / sort**, and **Review rules** above for the full model. Catalog v1 no longer defers star ratings or **Highest rated** sort. Decision record: [0001-product-reviews-and-verified-purchase](./adr/0001-product-reviews-and-verified-purchase.md).
