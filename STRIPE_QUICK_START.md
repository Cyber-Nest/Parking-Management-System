# Quick Start: Stripe Payment Integration

This guide will get you up and running with Stripe payments in 5 minutes.

## Prerequisites
✅ Backend is already configured with Stripe SDK  
✅ Frontend is already configured with Stripe React components  
✅ Payment endpoint and UI are ready

## Step 1: Create Your Stripe Account (2 minutes)

1. Visit **[https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)**
2. Sign up with your email
3. Complete basic business information
4. Verify your email

## Step 2: Get Your API Keys (1 minute)

1. Log in to **[Stripe Dashboard](https://dashboard.stripe.com)**
2. Click **Developers** → **API keys** (top menu)
3. Copy your test keys:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

![Keys Location](https://i.imgur.com/example.png)

## Step 3: Configure Backend (1 minute)

Edit `backend/owners_admin/.env`:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

**Replace `YOUR_KEY_HERE` with your actual keys from Stripe Dashboard**

## Step 4: Configure Frontend (1 minute)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 5: Test Payment Flow (Optional)

Start both servers:

```bash
# Terminal 1 - Backend
cd backend/owners_admin
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit the payment page and use test card:
- **Card**: `4242 4242 4242 4242`
- **Expiry**: `12/26` (any future date)
- **CVC**: `123` (any 3 digits)

## Done! ✅

Your payment system is now ready. The error "500" should be resolved once you add the Stripe keys.

---

## Test Cards Reference

| Scenario | Card | Status |
|----------|------|--------|
| Successful | `4242 4242 4242 4242` | ✅ Success |
| Failed | `4000 0000 0000 0002` | ❌ Decline |
| 3D Secure | `4000 0025 0000 3155` | 🔒 Auth Required |

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Stripe is not configured" | Add `STRIPE_SECRET_KEY` to `.env` |
| Cannot load Stripe | Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is in `.env.local` |
| 500 Error | Restart servers after updating `.env` files |
| Payment fails | Use test card numbers listed above |

---

## Going Live (Later)

When ready for production:

1. **Verify your Stripe account** (24-48 hours)
2. **Get live keys** (toggle "View test data" OFF in Stripe Dashboard)
3. **Update `.env` files** with `sk_live_` and `pk_live_` keys
4. **Deploy** to production

For detailed setup: See [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md)
