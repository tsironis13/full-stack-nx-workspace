# E-commerce Database Structure

## Overview

This schema models a flexible e-commerce catalog system with support for:

- Hierarchical product categories
- Product variants (SKUs)
- Dynamic attributes and attribute values
- Category-specific filtering attributes
- Product images
- Soft deletion
- Variant-based inventory structure

The design separates **Products** from **Product Items (Variants)**, allowing a single product to have multiple purchasable configurations such as size, color, storage, etc.

---

# Core Domain Concepts

| Concept                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| Product                | Logical product entity shown in the catalog      |
| Product Item           | Specific purchasable variant (SKU)               |
| Category               | Hierarchical grouping of products                |
| Attribute              | Filterable characteristic (Color, Size, RAM)     |
| Attribute Value        | Concrete value of an attribute (Black, XL, 16GB) |
| Category Attribute     | Defines which attributes belong to a category    |
| Product Item Attribute | Assigns attribute values to product variants     |
| Product Image          | Images attached to product variants              |

---

# Entity Relationship Overview

```text
Product Category
    └── Products
            └── Product Items (Variants)
                    ├── Product Images
                    └── Product Item Attributes
                            ├── Attributes
                            └── Attribute Values
```

---

# Tables

---

# `product_categories`

Represents hierarchical catalog categories.

Examples:

- Electronics
- Smartphones
- Laptops
- Clothing

Supports nested categories using a self-referencing parent relationship.

---

## Columns

| Column             | Type       | Description                |
| ------------------ | ---------- | -------------------------- |
| id                 | serial PK  | Unique category identifier |
| name               | text       | Category name              |
| description        | text       | Category description       |
| image_url          | text       | Category thumbnail/banner  |
| parent_category_id | integer FK | Parent category reference  |
| created_at         | timestamp  | Creation timestamp         |
| updated_at         | timestamp  | Last update timestamp      |
| deleted_at         | timestamp  | Soft delete timestamp      |

---

## Relationships

| Relationship                | Type         |
| --------------------------- | ------------ |
| Category → Parent Category  | Many-to-One  |
| Category → Child Categories | One-to-Many  |
| Category → Products         | One-to-Many  |
| Category → Attributes       | Many-to-Many |

---

## Notes

- Supports unlimited category nesting.
- Uses soft deletion.
- Deleting a category cascades to products and category attributes.

---

# `products`

Represents the logical/base product entity.

Examples:

- iPhone 16
- Nike Air Max
- Samsung QLED TV

A product itself is not directly purchasable. Purchasable entities are `product_items`.

---

## Columns

| Column            | Type       | Description               |
| ----------------- | ---------- | ------------------------- |
| id                | serial PK  | Product identifier        |
| name              | text       | Product title             |
| description       | text       | Product description       |
| care_instructions | text       | Product care instructions |
| about             | text       | Marketing/about content   |
| category_id       | integer FK | Product category          |
| created_at        | timestamp  | Creation timestamp        |
| updated_at        | timestamp  | Last update timestamp     |
| deleted_at        | timestamp  | Soft delete timestamp     |

---

## Relationships

| Relationship            | Type        |
| ----------------------- | ----------- |
| Product → Category      | Many-to-One |
| Product → Product Items | One-to-Many |

---

## Notes

- Represents shared information across all variants.
- Variants inherit common product information.
- Soft deletion enabled.

---

# `product_items`

Represents a purchasable product variant (SKU).

Examples:

| Product   | Variant             |
| --------- | ------------------- |
| iPhone 16 | Black / 256GB       |
| T-Shirt   | Large / Red         |
| Laptop    | 32GB RAM / RTX 4070 |

---

## Columns

| Column          | Type             | Description             |
| --------------- | ---------------- | ----------------------- |
| id              | serial PK        | Variant identifier      |
| sku             | varchar          | Unique SKU/product code |
| original_price  | double precision | Original/base price     |
| sale_price      | double precision | Discounted price        |
| is_main_product | boolean          | Default/primary variant |
| product_id      | integer FK       | Parent product          |
| created_at      | timestamp        | Creation timestamp      |
| updated_at      | timestamp        | Last update timestamp   |
| deleted_at      | timestamp        | Soft delete timestamp   |

---

## Relationships

| Relationship              | Type         |
| ------------------------- | ------------ |
| Product Item → Product    | Many-to-One  |
| Product Item → Images     | One-to-Many  |
| Product Item → Attributes | Many-to-Many |

---

## Constraints

### One Main Variant Per Product

```sql
uniqueIndex('one_main_product_per_product')
.where(is_main_product = true)
```

Ensures only one variant can be marked as the primary/default product variant.

---

## Notes

- This is the actual purchasable entity.
- Pricing exists at variant level.
- Enables highly customizable products.

---

# `attributes`

Defines filterable/specification attributes.

Examples:

- Color
- Size
- Storage
- RAM
- Material

---

## Columns

| Column     | Type      | Description          |
| ---------- | --------- | -------------------- |
| id         | serial PK | Attribute identifier |
| name       | text      | Attribute name       |
| input_type | enum      | UI selection type    |

---

## Input Types

```ts
['radio', 'checkbox'];
```

### Meaning

| Type     | Purpose                    |
| -------- | -------------------------- |
| radio    | Single selectable value    |
| checkbox | Multiple selectable values |

---

## Relationships

| Relationship                 | Type         |
| ---------------------------- | ------------ |
| Attribute → Attribute Values | One-to-Many  |
| Attribute → Categories       | Many-to-Many |
| Attribute → Product Items    | Many-to-Many |

---

# `attribute_values`

Represents possible values for an attribute.

Examples:

| Attribute | Values             |
| --------- | ------------------ |
| Color     | Black, White, Blue |
| Size      | S, M, L            |
| RAM       | 8GB, 16GB, 32GB    |

---

## Columns

| Column       | Type       | Description      |
| ------------ | ---------- | ---------------- |
| id           | serial PK  | Value identifier |
| value        | text       | Actual value     |
| attribute_id | integer FK | Parent attribute |

---

## Relationships

| Relationship                    | Type         |
| ------------------------------- | ------------ |
| Attribute Value → Attribute     | Many-to-One  |
| Attribute Value → Product Items | Many-to-Many |

---

## Notes

- Deleting an attribute deletes all associated values.
- Centralized values simplify filtering.

---

# `category_attributes`

Defines which attributes are applicable to a category.

Examples:

| Category    | Attributes            |
| ----------- | --------------------- |
| Smartphones | Storage, RAM, Color   |
| Clothing    | Size, Material, Color |

---

## Columns

| Column       | Type       | Description         |
| ------------ | ---------- | ------------------- |
| category_id  | integer FK | Category reference  |
| attribute_id | integer FK | Attribute reference |

---

## Primary Key

```text
(category_id, attribute_id)
```

---

## Relationships

| Relationship         | Type         |
| -------------------- | ------------ |
| Category ↔ Attribute | Many-to-Many |

---

## Notes

This table enables:

- Dynamic filtering systems
- Category-specific specifications
- Smart faceted search

---

# `product_item_attributes`

Assigns actual attribute values to product variants.

Examples:

| Product Variant    | Attribute | Value |
| ------------------ | --------- | ----- |
| iPhone Black 256GB | Color     | Black |
| iPhone Black 256GB | Storage   | 256GB |

---

## Columns

| Column             | Type       | Description         |
| ------------------ | ---------- | ------------------- |
| product_item_id    | integer FK | Variant reference   |
| attribute_id       | integer FK | Attribute reference |
| attribute_value_id | integer FK | Selected value      |

---

## Composite Primary Key

```text
(product_item_id, attribute_value_id, attribute_id)
```

---

## Relationships

| Relationship                    | Type         |
| ------------------------------- | ------------ |
| Product Item ↔ Attribute Values | Many-to-Many |

---

## Notes

This table powers:

- Product filtering
- Variant specifications
- Search facets
- Variant differentiation

---

# `product_images`

Stores images for product variants.

---

## Columns

| Column          | Type       | Description           |
| --------------- | ---------- | --------------------- |
| id              | serial PK  | Image identifier      |
| url             | varchar    | Image URL             |
| product_item_id | integer FK | Variant reference     |
| created_at      | timestamp  | Creation timestamp    |
| updated_at      | timestamp  | Last update timestamp |
| deleted_at      | timestamp  | Soft delete timestamp |

---

## Relationships

| Relationship                 | Type        |
| ---------------------------- | ----------- |
| Product Image → Product Item | Many-to-One |

---

## Notes

- Images are attached to variants instead of base products.
- Allows variant-specific galleries.
- Supports color-specific imagery.

---

# Architectural Decisions

---

## Product vs Product Variant Separation

The schema intentionally separates:

| Entity       | Responsibility                |
| ------------ | ----------------------------- |
| Product      | Shared marketing/catalog data |
| Product Item | Purchasable SKU/variant       |

### Benefits

- Clean variant handling
- Flexible pricing
- Inventory-ready architecture
- Easier attribute management
- Better scalability

---

## Dynamic Attribute System

Attributes are fully dynamic and category-driven.

### Benefits

- No schema changes required for new filters
- Flexible faceted search
- Supports any product domain
- Reusable filtering system

---

## Hierarchical Categories

Self-referencing categories enable:

```text
Electronics
 ├── Laptops
 ├── Smartphones
 └── TVs
```

### Benefits

- Deep catalog organization
- Breadcrumb generation
- Tree navigation
- SEO-friendly URLs

---

## Soft Delete Strategy

Most tables include:

```sql
deleted_at timestamp
```

### Benefits

- Recoverable deletions
- Audit capability
- Safer data handling
- Historical preservation

---

# Example Data Flow

---

## Example Product Creation

### Product

```text
iPhone 16
```

### Variants

```text
Black / 128GB
Black / 256GB
Silver / 128GB
```

### Attributes

```text
Color → Black
Storage → 256GB
```

### Images

```text
black-front.jpg
black-back.jpg
```

---

# Typical Query Scenarios

---

## Product Listing

Query products by:

- Category
- Attribute filters
- Price range

---

## Variant Resolution

Find variant by selected attributes:

```text
Color = Black
Storage = 256GB
```

---

## Faceted Search

Dynamically generate filters based on:

```text
Category → Allowed Attributes
```

---

# Scalability Considerations

The schema is ready for future expansion with:

- Inventory management
- Warehouse support
- Product reviews
- Brand system
- Multi-currency pricing
- Localization
- SEO metadata
- Order management
- Supplier management
- Promotions/coupons

---

# Summary

This schema provides a scalable and flexible e-commerce foundation featuring:

- Variant-based catalog architecture
- Dynamic attributes
- Hierarchical categories
- Faceted filtering support
- SKU-level configuration
- Soft deletion
- Extensible design

It is suitable for:

- Fashion stores
- Electronics stores
- Marketplace platforms
- Configurable product catalogs
- Enterprise commerce systems
