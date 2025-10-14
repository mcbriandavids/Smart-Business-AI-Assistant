# Smart Business AI Assistant – Backend API

AI-powered small business marketplace backend built with Express, Mongoose, and Socket.IO.

## Quick start

```bash
# Windows (cmd)
cd /d C:\Smart Business AI Assistant\backend
npm install
npm run seed   # optional demo data
npm run dev
```

- Health check: `GET http://localhost:3000/health`
- Environment: `.env` at project root (see variables below)

## Security & middleware

- JWT auth with role-based authorization (customer, vendor, admin)
- Helmet, CORS, compression, rate limiting, and request logging (morgan)
- Input validation with Joi via a reusable `validate` middleware

## Authentication

- Register `POST /api/auth/register`
  - body: `{ firstName, lastName, email, phone, password, role?('customer'|'vendor') }`
- Login `POST /api/auth/login` with `{ email, password }`
- Me `GET /api/auth/me` (Bearer token)
- Update profile `PUT /api/auth/profile` (Bearer token)
- Change password `PUT /api/auth/change-password` (Bearer token)

Response (register/login):

```
{
  success: true,
  data: {
    user: { id, firstName, lastName, email, phone, role, ... },
    token: "<jwt>"
  }
}
```

## Users

- List users (admin) `GET /api/users?role=&search=&page=&limit=`
- Get user (self/admin) `GET /api/users/:id`
- Update user (self/admin) `PUT /api/users/:id`
- Delete user (admin) `DELETE /api/users/:id`
- Overview stats (admin) `GET /api/users/stats/overview`
- Toggle verify (admin) `PUT /api/users/:id/verify`
- Toggle active (admin) `PUT /api/users/:id/toggle-active`

## Businesses

Model note: `contact` contains `{ email, phone, website?, socialMedia? }`. Address carries `{ coordinates: { lat, lng } }`.

- Create (vendor) `POST /api/businesses`
  - body: `{ name, description, category, address, contact, businessHours?, services?, paymentMethods? }`
- List (public) `GET /api/businesses?search=&category=&latitude=&longitude=&maxDistanceKm=&page=&limit=`
  - Supports filtering by `latitude`,`longitude` and `maxDistanceKm`.
  - Response shape: `{ success, data: { items, pagination } }`
- Get by id (public) `GET /api/businesses/:id`
- Update (owner/admin) `PUT /api/businesses/:id`
- Delete (owner/admin) `DELETE /api/businesses/:id`
- Verify (admin) `PUT /api/businesses/:id/verify`
- Categories (public) `GET /api/businesses/categories/list`
- Open status (public) `GET /api/businesses/:id/status`
- Nearby (public) `GET /api/businesses/nearby/:longitude/:latitude?maxDistanceKm=`
  - Response shape: `{ success, data: { businesses, count } }`

## Products

- Create (vendor/admin) `POST /api/products`
  - body: Product schema fields; business auto-inferred for vendors
- List (public) `GET /api/products?business=&category=&search=&minPrice=&maxPrice=&available=&featured=&sort=&tags=&page=&limit=`
  - sort: `relevance|newest|price_asc|price_desc`
  - Response shape: `{ success, data: { products, pagination } }`
- Get by id (public) `GET /api/products/:id`
- Update (owner/admin) `PUT /api/products/:id`
- Delete (owner/admin) `DELETE /api/products/:id`
- Toggle active (owner/admin) `PUT /api/products/:id/toggle-active`

## Orders

- Create (customer) `POST /api/orders`
  - body: `{ business, items: [{ product, quantity, variants?, notes? }], deliveryInfo: { type('delivery'|'pickup'), ... }, paymentInfo?, customerNotes? }`
- List (auth) `GET /api/orders?page=&limit=` (auto-scoped by role)
- Get by id (auth) `GET /api/orders/:id`
- Update status (vendor/admin) `PUT /api/orders/:id/status` with body `{ status, note? }`

Pricing rules:

- Per item unitPrice = effective price (sale if lower else regular) + variant modifiers
- Order subtotal = sum of item subtotals
- Service charge ≈ business.settings.serviceChargePercentage% (defaults to 0 if unspecified)
- Delivery fee from `business.services.delivery.fee` if delivery
- Total = subtotal + serviceCharge + deliveryFee + tax - discount

## Notifications

- List (auth) `GET /api/notifications?page=&limit=` returns `{ items, unread, pagination }`
- Mark read (auth) `PUT /api/notifications/:id/read`
- Announce (admin) `POST /api/notifications/announce` with body `{ title, message, recipients: [userId] | 'all' }`
  - Notification `type` used: `announcement`

## Vendor Contacts & Broadcasts

- List contacts (vendor/admin) `GET /api/vendor-customers?page=&limit=&search=&vendorId=`
- Create/update contact (vendor/admin) `POST /api/vendor-customers`
- Delete contact (vendor/admin) `DELETE /api/vendor-customers/:id`
- Broadcast to contacts (vendor/admin) `POST /api/vendor-customers/broadcast`
- Customer reply `POST /api/vendor-customers/:id/reply`

## Admin

- Stats `GET /api/admin/stats`
- List users `GET /api/admin/users?page=&limit=`
- Toggle user active `PUT /api/admin/users/:id/toggle-active`

## Environment

`.env` values:

```
MONGODB_URI=mongodb://localhost:27017/smart-business-ai
MONGODB_URI_TEST=mongodb://localhost:27017/smart-business-ai-test
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret
JWT_EXPIRE=7d
SERVICE_CHARGE_PERCENTAGE=0
```

## Scripts

- `npm start` – start server
- `npm run dev` – start with nodemon
- `npm test` – run Mocha test suite
- `npm run seed` – seed optional demo data
- `npm run check:filenames` – enforce naming conventions

Naming conventions (enforced by `check-filenames`):

- Models: `kebab-case.model.js`
- Controllers: `kebab-case.controller.js`
- Routes: `kebab-case.js`
- Services: `NameService.js` (PascalCase suffix)
- Middleware: `kebab-case.js`

## Testing

```bash
cd /d C:\Smart Business AI Assistant\backend
npm test
```

- Tests run in `NODE_ENV=test` and spin up the app with an in-memory MongoDB if configured (mongodb-memory-server).
- Suites include: `admin.test.js`, `auth.test.js`, `businesses.test.js`, `businesses-extended.test.js`, `notifications.test.js`, `notifications-announce.test.js`, `orders.test.js`, `orders-status.test.js`, `products.test.js`, `users.test.js`, `vendor-customers.test.js`.
- Test-only helpers: `/api/test/bootstrap-admin` issues an admin token (available only under `NODE_ENV=test`).

## Sockets

- Rooms: `user_{userId}`, `vendor_{ownerId}`
- Events: `order.created`, `order.status`

## Notes

- Geospatial: numeric `{lat,lng}` stored under `address.coordinates`. Nearby search uses Haversine in-app and returns `{ businesses, count }`. For MongoDB geo queries, migrate to GeoJSON with 2dsphere indexes.

## Run with Docker 🐳

Containerized development and testing is available via the top-level `docker-compose.yml`.

Prerequisites:

- Docker Desktop running (Windows/macOS) or Docker Engine (Linux).

Start the stack:

```bash
# From repo root (C:\Smart Business AI Assistant)
docker compose up -d --build
```

Service ports (host → container):

- Backend API: http://localhost:5001 → 3000
- MongoDB: localhost:27018 → 27017

Configuration in containers:

- The backend uses `MONGODB_URI=mongodb://mongo:27017/smart-business-ai` to talk to the `mongo` service.
- Metrics are enabled by default in compose via `ENABLE_METRICS=true`.

Verify endpoints in your browser:

- Health: http://localhost:5001/health
- Readiness: http://localhost:5001/ready
- Metrics: http://localhost:5001/metrics

Logs and lifecycle:

```bash
docker compose ps
docker compose logs -f backend
docker compose down          # stop
docker compose down -v       # stop and remove volumes
```

Troubleshooting:

- If port 5001 or 27018 is busy, edit `docker-compose.yml` to remap host ports (e.g., `6001:5000`).
- Hitting `/` may return 404; use `/health` to confirm the API is up.
- If `/metrics` returns 404, ensure `ENABLE_METRICS=true` in compose (already set here).
