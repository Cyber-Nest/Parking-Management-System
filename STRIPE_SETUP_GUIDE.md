# Stripe Integration Setup Guide

This guide walks you through creating and integrating a Stripe account for payment processing in the ParkSmart application.

## Table of Contents
1. [Create Stripe Account](#create-stripe-account)
2. [Get API Keys](#get-api-keys)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Configuration](#frontend-configuration)
5. [Testing Stripe Integration](#testing-stripe-integration)
6. [Going Live](#going-live)

---

## Create Stripe Account

### Step 1: Sign Up
1. Visit [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Enter your email address
3. Create a strong password
4. Accept the Stripe Services Agreement
5. Click **Sign up**

### Step 2: Complete Account Setup
1. Fill in your business information:
   - Business name: `ParkSmart`
   - Industry: Select **Parking/Transportation**
   - Business URL: Your application URL
   - Country/Region: Select your country

2. Add your legal business details
3. Accept the terms and proceed

### Step 3: Verify Your Email
- Check your email for a verification link
- Click the link to verify your account

---

## Get API Keys

### Step 1: Access Your API Keys
1. Log into your Stripe dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Click **Developers** in the top left menu
3. Click **API keys** from the submenu

### Step 2: Copy Your Keys
You'll see two types of keys:

#### **Publishable Key** (Frontend)
- Format: `pk_test_...` (development) or `pk_live_...` (production)
- Used in frontend code (safe to expose)
- Example: `pk_test_51OkZxaD5KLHS5j3t9z8x...`

#### **Secret Key** (Backend)
- Format: `sk_test_...` (development) or `sk_live_...` (production)
- **NEVER expose this in frontend code or version control**
- Example: `sk_test_51OkZxaD5KLHS5j3t9z8x...`

#### **Webhook Signing Secret** (Optional but Recommended)
- Found under "Webhooks" section
- Format: `whsec_...`
- Used for listening to Stripe events

---

## Backend Configuration

### Step 1: Update `.env` File
Open `backend/owners_admin/.env` and add the following Stripe configuration:

```env
# ── Stripe (Payment Processing) ──────────────────────────
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Step 2: Example Configuration
```env
# ── Stripe (Payment Processing) ──────────────────────────
STRIPE_SECRET_KEY=sk_test_51OkZxaD5KLHS5j3t9z8xYourSecretKeyHere
STRIPE_PUBLISHABLE_KEY=pk_test_51OkZxaD5KLHS5j3t9z8xYourPublishableKeyHere
STRIPE_WEBHOOK_SECRET=whsec_1OkZxaD5KLHS5j3t9z8xYourWebhookSecretHere
```

⚠️ **IMPORTANT**: Never commit the `.env` file to version control. It's already in `.gitignore`.

### Step 3: Verify Backend Integration
The backend service (`src/services/customer.service.ts`) already includes:
- Payment intent creation
- Stripe error handling
- Amount conversion (cents)

No additional backend code changes needed!

---

## Frontend Configuration

### Step 1: Add Stripe Publishable Key
Open `frontend/.env.local` and add:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

Example:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51OkZxaD5KLHS5j3t9z8xYourPublishableKeyHere
```

⚠️ **Important**: Use `NEXT_PUBLIC_` prefix so it's accessible in the browser.

### Step 2: Verify Stripe Packages
The frontend already has Stripe packages installed:
```bash
@stripe/react-stripe-js: "^6.3.0"
@stripe/stripe-js: "^9.3.1"
```

### Step 3: Update Payment Component
The payment page (`src/app/(customer)/payment/page.tsx`) already includes:
- Stripe Elements setup
- Payment form integration
- Error handling

No additional changes needed!

---

## Testing Stripe Integration

### Step 1: Use Test Credentials
Stripe provides test cards for development:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/26`)
- CVC: Any 3 digits (e.g., `123`)

**Failed Payment:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**3D Secure Required:**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

### Step 2: Test Payment Flow
1. Start your backend server:
   ```bash
   cd backend/owners_admin
   npm run dev
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to the payment page and complete a test transaction

### Step 3: Verify in Stripe Dashboard
1. Go to **Payments** → **Payments** in your Stripe dashboard
2. You should see your test payment listed
3. Check the payment details to confirm

---

## Going Live

### Step 1: Get Live Keys
1. In Stripe dashboard, toggle **View test data** to OFF
2. Navigate to **Developers** → **API keys**
3. Copy your live keys:
   - **Live Publishable Key**: `pk_live_...`
   - **Live Secret Key**: `sk_live_...`

### Step 2: Update Production Environment
1. Update your production `.env` file with live keys:
   ```env
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
   STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
   ```

2. Update frontend `.env.production`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
   ```

### Step 3: Complete Stripe Verification
1. Complete Stripe's business verification
2. Provide bank details for payouts
3. Wait for Stripe to approve your account (usually 24-48 hours)

### Step 4: Deploy
1. Deploy backend with live Stripe credentials
2. Deploy frontend with live Stripe key
3. Test a live payment with a real card

---

## Architecture Overview

### Payment Flow
```
1. Customer enters amount on payment page
2. Frontend calls: POST /api/customer/payment-intents
3. Backend creates Stripe PaymentIntent
4. Backend returns clientSecret to frontend
5. Frontend loads Stripe Elements
6. Customer enters card details
7. Frontend confirms payment with Stripe
8. Backend receives webhook notification
9. Payment recorded in database
```

### Key Files
- **Backend**:
  - `src/services/customer.service.ts` - Payment intent creation
  - `src/controllers/customer.controller.ts` - Payment endpoints
  - `src/routes/customer.routes.ts` - Route definitions

- **Frontend**:
  - `src/services/customer.service.ts` - API calls
  - `src/app/(customer)/payment/page.tsx` - Payment UI

---

## Troubleshooting

### Error: "Stripe is not configured"
**Solution**: Add `STRIPE_SECRET_KEY` to backend `.env` file

### Error: "Cannot read stripe keys in frontend"
**Solution**: 
- Use `NEXT_PUBLIC_` prefix in `.env.local`
- Restart the Next.js dev server
- Hard refresh your browser (Ctrl+Shift+R)

### Payment fails with "Invalid API Key format"
**Solution**: 
- Verify key format (test keys start with `pk_test_` or `sk_test_`)
- Copy key without extra spaces
- Check you're in development mode (View test data: ON)

### Webhook failures
**Solution**:
- Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
- Use Stripe CLI for local webhook testing
- Check webhook logs in Stripe dashboard

---

## Security Best Practices

✅ **DO:**
- Use environment variables for all keys
- Keep `.env` files in `.gitignore`
- Rotate keys regularly
- Use HTTPS in production
- Validate amounts server-side
- Implement rate limiting on payment endpoints

❌ **DON'T:**
- Hardcode keys in source code
- Commit `.env` files to version control
- Expose secret keys in frontend
- Log sensitive payment information
- Skip PCI compliance requirements

---

## Additional Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Payment Processing Guide**: [https://stripe.com/docs/payments](https://stripe.com/docs/payments)
- **Testing**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)

---

## Questions?

For more help:
1. Check Stripe documentation
2. Contact Stripe support: [https://support.stripe.com](https://support.stripe.com)
3. Review your Stripe API logs in the dashboard
