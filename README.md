# Parking-Management-System
Web-based Parking Management System with QR entry, Stripe payments, admin panel, and enforcement app for issuing penalty tickets.

## Environment Variables

- Backend: set `STRIPE_SECRET_KEY` in `backend/owners_admin/.env` or your environment.
- Frontend: set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `frontend/.env.local`.

These keys are required for the customer checkout Stripe flow.
