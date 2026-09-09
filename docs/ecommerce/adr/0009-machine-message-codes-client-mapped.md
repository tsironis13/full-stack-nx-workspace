# Machine messages are stable codes; the storefront maps them to UI Language

`ecommerce-api` and `ai-server` emit stable **message codes** (with English fallback copy for logs) instead of shopper-facing Greek or `Accept-Language` negotiation. The storefront maps: body **code** first, then known HTTP statuses (401, 403, 404, 409, 422, 503), then a generic chrome message. Raw server strings are never shown. **Cart Item workflow** A2UI chrome uses the same codes; **Product** names, **options**, and **Category** path stay stored data.
