# NestJS + Drizzle ORM Scalable Architecture Guide

## Overview

This document describes a scalable, maintainable, and production-grade architecture for building backend applications using:

- [NestJS](https://nestjs.com?utm_source=chatgpt.com)
- [Drizzle ORM](https://orm.drizzle.team?utm_source=chatgpt.com)
- PostgreSQL
- Domain-Driven Design principles
- Clean Architecture concepts
- Modular Monolith architecture

The goal of this architecture is to create applications that are:

- easy to scale
- easy to maintain
- highly testable
- framework-independent at the core
- modular
- suitable for long-term development

This structure works extremely well for:

- SaaS platforms
- ecommerce systems
- enterprise APIs
- marketplace platforms
- multi-team development
- Nx monorepos

---

# Architectural Philosophy

The architecture is based on several key principles.

---

# 1. Feature-Based Architecture

Organize the application by business domains/features instead of technical categories.

✅ Good:

```txt id="f1"
modules/
  users/
  orders/
  catalog/
  auth/
```

❌ Bad:

```txt id="f2"
controllers/
services/
repositories/
entities/
```

Feature-driven organization:

- scales better
- improves discoverability
- reduces coupling
- aligns with DDD

---

# 2. Separation of Concerns

Each layer has a single responsibility.

| Layer          | Responsibility            |
| -------------- | ------------------------- |
| Presentation   | HTTP/API layer            |
| Application    | Use cases/workflows       |
| Domain         | Business rules            |
| Infrastructure | Database/external systems |

---

# 3. Dependency Inversion

The domain layer must not depend on:

- NestJS
- Drizzle
- PostgreSQL
- Redis
- external APIs

Instead:

```txt id="dip1"
Infrastructure → Domain
```

NOT:

```txt id="dip2"
Domain → Infrastructure
```

This keeps business logic portable and testable.

---

# 4. Modular Monolith First

Start with a modular monolith.

Avoid premature microservices.

A modular monolith provides:

- faster development
- simpler deployments
- easier debugging
- transactional consistency

NestJS is excellent for this approach.

---

# High-Level Architecture

```txt id="arch1"
HTTP Request
    ↓
Controller
    ↓
DTO Validation
    ↓
Use Case
    ↓
Domain Logic
    ↓
Repository Interface
    ↓
Drizzle Repository
    ↓
PostgreSQL
```

---

# Recommended Project Structure

```txt id="root1"
src/
├── modules/
│
│   ├── users/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   ├── users.module.ts
│   │   └── index.ts
│   │
│   ├── auth/
│   ├── catalog/
│   ├── orders/
│   ├── cart/
│   ├── payments/
│   └── inventory/
│
├── database/
├── shared/
├── common/
├── config/
├── app.module.ts
└── main.ts
```

---

## Monorepo layout (`apps/ecommerce-api`)

In this workspace the Nest app **`apps/ecommerce-api`** follows the same **modules → vertical slice** idea under a single `src/modules/` root (not a flat `controllers/` / `services/` tree at `src/`):

```txt
apps/ecommerce-api/src/
├── app/
│   └── app.module.ts          # imports feature modules from ../modules/*
├── modules/
│   └── <feature>/             # e.g. products, catalog, orders
│       ├── <feature>.module.ts
│       ├── presentation/      # controllers, request validation at HTTP boundary
│       ├── application/       # use cases, orchestration; optional application/dto for response shapes
│       ├── domain/            # types, enums, domain rules (no Nest/Drizzle imports)
│       └── infrastructure/   # Drizzle repositories, persistence, external clients
├── db/                        # Drizzle schema (shared database folder for the app)
├── drizzle/
└── main.ts
```

New backend capabilities **must** live under **`src/modules/<name>/`** with **`presentation/`**, **`application/`**, **`domain/`**, and **`infrastructure/`** folders as needed. Do **not** add ad-hoc `src/<topic>/` folders that mix layers in one directory.

**DTO placement:** **Request** DTOs (body/query validation) belong in **`presentation/`**. **Response shapes** produced by use cases may live under **`application/dto/`** so **`application`** does not depend on **`presentation`**; controllers stay thin and call application services.

---

# Layer Breakdown

# 1. Presentation Layer

## Purpose

The presentation layer handles:

- HTTP requests
- validation
- authentication
- serialization
- API responses

This layer contains:

- controllers
- DTOs
- guards
- interceptors
- filters
- pipes

---

# Structure

```txt id="pres1"
presentation/
├── controllers/
├── dto/
├── guards/
├── interceptors/
├── serializers/
└── filters/
```

---

# Controllers

Controllers should remain thin.

Their job:

- receive request
- validate input
- call use case
- return response

---

# Good Example

```ts id="ctrl1"
@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }
}
```

---

# Bad Example

```ts id="ctrl2"
@Post()
async create(@Body() dto: CreateUserDto) {
  const existing = await this.db.query.users.findFirst();

  if (existing) {
    throw new BadRequestException();
  }

  const hash = await bcrypt.hash(dto.password);

  return this.db.insert(users).values({
    ...
  });
}
```

Controllers should NEVER contain:

- SQL
- business rules
- transactions
- orchestration logic

---

# DTOs

DTOs define:

- API contracts
- request validation
- response shape

Example:

```ts id="dto1"
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
```

---

# Validation

Use global validation.

```ts id="val1"
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
);
```

---

# Why Validation Matters

| Option               | Benefit                   |
| -------------------- | ------------------------- |
| whitelist            | strips unknown fields     |
| forbidNonWhitelisted | blocks malicious payloads |
| transform            | auto-converts primitives  |

---

# Guards

Use guards for:

- authentication
- authorization

Examples:

- JwtAuthGuard
- RolesGuard
- PermissionsGuard

---

# Avoid

❌ Avoid permission checks inside controllers.

---

# Interceptors

Useful for:

- logging
- response formatting
- caching
- timing

---

# Filters

Use exception filters to:

- standardize API errors
- centralize exception handling

---

# 2. Application Layer

## Purpose

The application layer contains:

- use cases
- orchestration
- workflows
- transactions

This is the core execution layer.

---

# Structure

```txt id="app1"
application/
├── use-cases/
├── services/
├── commands/
├── queries/
└── events/
```

---

# Use Cases

Each use case represents a business action.

Examples:

- CreateUser
- PlaceOrder
- AddToCart
- RefundPayment

---

# Example

```ts id="uc1"
@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository, private readonly hashService: HashService) {}

  async execute(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);

    if (existing) {
      throw new EmailAlreadyExistsException();
    }

    const hashed = await this.hashService.hash(dto.password);

    return this.usersRepository.create(
      User.create({
        email: dto.email,
        password: hashed,
      })
    );
  }
}
```

---

# Why Use Cases Matter

Benefits:

- reusable workflows
- easy testing
- clean orchestration
- isolated business logic

Use cases can be triggered from:

- REST APIs
- GraphQL
- queues
- cron jobs
- WebSockets

---

# Transactions

Transactions belong in the application layer.

Good:

```ts id="tx1"
await this.db.transaction(async (tx) => {
  await this.ordersRepository.create(order, tx);

  await this.inventoryRepository.reserve(items, tx);
});
```

---

# Why?

Because workflows often span:

- multiple repositories
- multiple aggregates
- multiple services

Repositories should not secretly create transactions.

---

# CQRS (Optional)

Use CQRS only for complex domains.

---

# Command Side

Handles writes:

- create
- update
- delete

---

# Query Side

Handles reads:

- reports
- analytics
- search

---

# Avoid CQRS For

Simple CRUD systems.

---

# 3. Domain Layer

## Purpose

Contains:

- business rules
- entities
- value objects
- repository contracts
- domain services
- domain events

This layer should be framework-independent.

---

# Structure

```txt id="domain1"
domain/
├── entities/
├── value-objects/
├── repositories/
├── services/
├── events/
└── exceptions/
```

---

# Entities

Entities represent business concepts with identity.

Example:

```ts id="entity1"
export class User {
  constructor(public readonly id: string, public email: string, private password: string) {}

  changeEmail(email: string) {
    if (!email.includes('@')) {
      throw new InvalidEmailException();
    }

    this.email = email;
  }
}
```

---

# Important Principle

Entities contain BEHAVIOR.

Avoid anemic entities.

Bad:

```ts id="entity2"
class User {
  email: string;
}
```

---

# Value Objects

Immutable business concepts.

Examples:

- Email
- Money
- Address
- Percentage

---

# Example

```ts id="vo1"
export class Email {
  constructor(public readonly value: string) {
    if (!value.includes('@')) {
      throw new InvalidEmailException();
    }
  }
}
```

---

# Repository Contracts

The domain defines repository abstractions.

Example:

```ts id="repo1"
export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;

  abstract create(user: User): Promise<User>;
}
```

---

# Why Repository Abstractions Matter

Without abstractions:

```txt id="badrepo1"
Business Logic → Drizzle Directly
```

With abstractions:

```txt id="goodrepo1"
Business Logic
    ↓
Repository Contract
    ↓
Drizzle Implementation
```

This decouples business logic from persistence.

---

# Domain Services

Domain services contain:

- business calculations
- complex rules
- reusable domain logic

Examples:

- pricing engine
- tax calculations
- discount engine

---

# Domain Events

Used for decoupling modules.

Examples:

- UserCreated
- OrderPlaced
- PaymentSucceeded

---

# 4. Infrastructure Layer

## Purpose

Contains implementations for:

- database
- queues
- email
- cache
- storage
- external APIs

---

# Structure

```txt id="infra1"
infrastructure/
├── database/
├── repositories/
├── persistence/
├── mappers/
├── queue/
├── cache/
├── mail/
└── external-services/
```

---

# Drizzle ORM Architecture

# Core Principle

Drizzle must remain isolated inside infrastructure.

Drizzle should NEVER leak into:

- controllers
- domain entities
- use cases

---

# Database Structure

```txt id="drizzle1"
database/
├── schema/
├── migrations/
├── drizzle.module.ts
├── drizzle.service.ts
├── database.types.ts
└── drizzle.config.ts
```

---

# Schema Definitions

Example:

```ts id="schema1"
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

# Important Rule

Drizzle schemas are NOT domain entities.

Schema:

- persistence model

Entity:

- business model

Never merge them.

---

# Drizzle Module

Centralized DB provider.

```ts id="drizzle2"
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: async (config: ConfigService) => {
        const client = postgres(config.get('DATABASE_URL'));

        return drizzle(client);
      },
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
```

---

# Repository Implementations

Example:

```ts id="repo2"
@Injectable()
export class DrizzleUsersRepository implements UsersRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDb
  ) {}

  async findByEmail(email: string) {
    const row = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!row) {
      return null;
    }

    return UserMapper.toDomain(row);
  }
}
```

---

# Mappers

Mappers convert:

```txt id="mapper1"
DB Row ↔ Domain Entity
```

---

# Example

```ts id="mapper2"
export class UserMapper {
  static toDomain(row: UserRow): User {
    return new User(row.id, row.email, row.password);
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
    };
  }
}
```

---

# Why Mappers Matter

Avoid leaking persistence structures into business logic.

---

# Query Organization

For complex queries:

```txt id="query1"
infrastructure/
├── queries/
│   ├── analytics/
│   ├── reporting/
│   └── search/
```

---

# Benefits

Complex SQL:

- remains isolated
- easier to optimize
- easier to maintain

---

# Migrations

Use Drizzle migrations.

Commands:

```bash id="mig1"
drizzle-kit generate
drizzle-kit migrate
```

---

# NEVER

❌ Never auto-sync schemas in production.

Always use migrations.

---

# Shared Layer

## Purpose

Contains reusable utilities.

Examples:

- logger
- date utilities
- event bus
- pagination utilities

---

# Avoid

❌ Do not place business logic here.

---

# Config Layer

# Structure

```txt id="cfg1"
config/
├── app.config.ts
├── database.config.ts
├── auth.config.ts
└── env.validation.ts
```

---

# Environment Validation

Validate env vars at startup.

---

# Logging Architecture

# Recommended

Use:

- [Pino](https://getpino.io?utm_source=chatgpt.com)
- structured logs
- request IDs

---

# Example

```json id="log1"
{
  "requestId": "abc123",
  "message": "Order created"
}
```

---

# Observability

Recommended:

- [OpenTelemetry](https://opentelemetry.io?utm_source=chatgpt.com)
- [Sentry](https://sentry.io?utm_source=chatgpt.com)
- [Grafana](https://grafana.com?utm_source=chatgpt.com)

---

# Background Jobs

Use queues for:

- emails
- webhooks
- exports
- image processing

Recommended:

- [BullMQ](https://bullmq.io?utm_source=chatgpt.com)
- Redis

---

# API Documentation

Use:

- [Swagger OpenAPI](https://swagger.io/specification/?utm_source=chatgpt.com)

Example:

```ts id="swagger1"
@ApiTags('users')
```

---

# Testing Strategy

# Unit Tests

Test:

- use cases
- entities
- domain services

Mock repository contracts.

---

# Integration Tests

Test:

- Drizzle repositories
- database interactions

Use:

- [Testcontainers](https://testcontainers.com?utm_source=chatgpt.com)

---

# E2E Tests

Test:

- full request flows
- auth
- permissions
- API contracts

---

# Monorepo Architecture

Recommended:

- [Nx](https://nx.dev?utm_source=chatgpt.com)

Great for:

- frontend/backend sharing
- multiple apps
- shared libraries

---

# Ecommerce Example

```txt id="ecom1"
modules/
├── catalog/
├── inventory/
├── cart/
├── checkout/
├── payments/
├── shipping/
└── users/
```

Each module owns:

- schema
- repositories
- business rules
- APIs

---

# Common Mistakes

# 1. Fat Services

```txt id="mist1"
UsersService = 3000 lines
```

Solution:

- use cases
- domain services

---

# 2. Leaking Drizzle Everywhere

Bad:

```ts id="mist2"
@Controller()
export class UsersController {
  constructor(private db: DrizzleDb) {}
}
```

---

# 3. Generic CRUD Repositories

Avoid:

```ts id="mist3"
BaseRepository<T>;
```

Prefer:

- business-oriented repositories

---

# 4. Circular Dependencies

Avoid excessive:

```ts id="mist4"
forwardRef();
```

Usually indicates bad boundaries.

---

# 5. Shared Module Abuse

Avoid:

```txt id="mist5"
shared/
  everything/
```

---

# Recommended Stack

| Concern    | Technology      |
| ---------- | --------------- |
| Framework  | NestJS          |
| ORM        | Drizzle         |
| Database   | PostgreSQL      |
| Validation | class-validator |
| Queue      | BullMQ          |
| Cache      | Redis           |
| Logging    | Pino            |
| Monitoring | OpenTelemetry   |
| Testing    | Jest            |
| Monorepo   | Nx              |

---

# Final Recommendations

Prioritize:

- modularity
- explicit workflows
- strong boundaries
- business-oriented architecture
- maintainability

Avoid:

- premature microservices
- unnecessary CQRS
- overengineering

---

# Golden Rule

A scalable NestJS architecture is not about adding more layers or patterns.

It is about:

- clear boundaries
- controlled dependencies
- isolated business logic
- maintainable workflows
- long-term scalability.
