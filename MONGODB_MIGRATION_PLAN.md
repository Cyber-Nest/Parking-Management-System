# MySQL to MongoDB migration

## Status

The active Owners Admin API uses MongoDB for runtime reads and writes. MongoDB is connected and pinged before the server listens; the shared index definitions are installed at startup for both the regular and serverless entry points. Graceful shutdown closes the MongoDB client.

Repositories and services migrated: admins, auth tokens, roles and permissions, users, settings and branding, lots, zones, plans, pricing, taxes, penalty rules, bookings, sessions, payments, transactions, invoices, officers, officer portal shifts/offline records, tickets, enforcement/evidence, email logs, exports, ticket numbering, and reports. String IDs are retained as Mongo `_id` values, and API response shapes were kept during the conversions.

The unused Sequelize models, MySQL runtime connection/schema migration, legacy MySQL seed/maintenance scripts, and SQL-backed startup hooks were removed. MySQL 2 remains installed solely for the explicit source data import command. No MySQL connection is opened by the application.

## Data import

1. Configure `MONGODB_URI` for the target Atlas database and `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` for the source MySQL database in a local, untracked `.env`.
2. Stop or pause writes to the MySQL source so paginated reads form a consistent snapshot.
3. Run `npm run db:init` to create indexes and built-in roles.
4. Run `npm run db:migrate -- --dry-run` to validate source table reads without writing MongoDB documents.
5. Run `npm run db:migrate` to import in batches, then inspect row-count output and the Atlas collections before switching application traffic.

The importer pages every source table by its primary key, uses deterministic IDs for composite/no-ID rows, and upserts with `$setOnInsert` so reruns do not overwrite MongoDB data. It imports to collections with the same names as source tables. Built-in role documents are matched by role name and source role references are mapped to their MongoDB `_id` values. It never writes to MySQL and does not delete destination records. Source and destination credentials are not included in the repository or logs. Keep the MySQL dependency until the import is no longer needed.

## Verification and known limits

- `npm run typecheck` and `npm run build` pass after the migration.
- The MongoDB URI was not available as a configured local secret, so a live Atlas connection, index creation against production data, migration dry run, and endpoint integration checks could not be performed here.
- Integration verification should use a non-production Atlas database and representative copied records. Pay particular attention to report date boundaries, historical records with null dates, ticket evidence, and indexes against pre-existing data.
- Backend package installation reports npm audit advisories; dependency remediation was outside this database migration and was not applied.

## Batch log

- Added MongoDB driver/configuration, startup readiness, shared index definitions, initializer, and MongoDB-backed admin seed.
- Converted the remaining application repositories and services, including cross-collection report aggregations, ticket/enforcement workflows, payment history, officer portal, and evidence handling.
- Removed MySQL from app startup and the serverless handler; removed unused Sequelize models and legacy SQL setup/maintenance scripts and commands.
- Added the safe, batched MySQL-to-MongoDB importer for existing installations.
- Imported the configured source database on 2026-10-31: all 26 tables and 893 rows were copied. Per-table source row counts matched MongoDB document counts, and the importer confirmed that MySQL was not modified. The import used Atlas seed-list connection details resolved through Windows DNS because Node's SRV lookup returned `ECONNREFUSED`; TLS certificate validation remained enabled through Node's system CA option. No credentials or direct connection URI were written to the repository.
- Verified with `npm run typecheck` and `npm run build`. The import itself was live database validation; full HTTP/API workflow checks against the migrated records remain outstanding.
