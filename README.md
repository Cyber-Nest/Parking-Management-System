# Parking-Management-System
Web-based Parking Management System with QR entry, Stripe payments, admin panel, and enforcement app for issuing penalty tickets.

## Environment Variables

- Backend: set `STRIPE_SECRET_KEY` in `backend/owners_admin/.env` or your environment.
- Frontend: set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `frontend/.env.local`.

These keys are required for the customer checkout Stripe flow.

## Backend database

The Owners Admin API uses MongoDB. In `backend/owners_admin`, copy `.env.example` to `.env`, set `MONGODB_URI`, and set the JWT secrets before starting the backend. Initialize database indexes and built-in roles with `npm run db:init`; create the first owner account with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `ADMIN_NAME`, then run `npm run seed`.

For an existing MySQL installation, set the source `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in the local backend `.env`. Pause MySQL writes during the import, initialize MongoDB, validate with `npm run db:migrate -- --dry-run`, then import with `npm run db:migrate`. The importer does not modify the MySQL source. See [MONGODB_MIGRATION_PLAN.md](MONGODB_MIGRATION_PLAN.md) for migration details.
