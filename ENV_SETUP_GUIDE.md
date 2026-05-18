# .env Setup Instructions

This file explains how to properly configure your environment variables for Stripe payments.

## Quick Links
- **Stripe Dashboard**: https://dashboard.stripe.com
- **API Keys Page**: https://dashboard.stripe.com/apikeys
- **Test Cards**: https://stripe.com/docs/testing

---

## Backend Configuration

### File: `backend/owners_admin/.env`

#### Current Configuration (with placeholders)
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

#### What You Need to Do

1. **Log in to Stripe Dashboard**
   - Go to: https://dashboard.stripe.com

2. **Navigate to API Keys**
   - Click "Developers" in top menu
   - Click "API keys" in submenu
   - Make sure "View test data" is ON (for development)

3. **Copy Your Test Keys**

   **For Secret Key:**
   - Find the field labeled "Secret key"
   - It starts with `sk_test_`
   - Click "Copy" button
   - Paste into `.env` file:
     ```env
     STRIPE_SECRET_KEY=sk_test_YOUR_COPIED_KEY
     ```

   **For Publishable Key:**
   - Find the field labeled "Publishable key"
   - It starts with `pk_test_`
   - Click "Copy" button
   - Paste into `.env` file:
     ```env
     STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_COPIED_KEY
     ```

4. **Webhook Secret (Optional for now)**
   - Go to "Webhooks" section
   - Add endpoint: `http://localhost:5000/api/webhooks/stripe` (development)
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the signing secret (starts with `whsec_`)
   - Paste into `.env` file:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_YOUR_COPIED_SECRET
     ```

5. **Save and Restart Backend**
   ```bash
   # Terminal in backend/owners_admin
   # Stop the dev server (Ctrl+C)
   npm run dev
   ```

#### Example Configuration (TEST MODE)
```env
STRIPE_SECRET_KEY=sk_test_51OkZxaD5KLHS5j3t9z8xYourActualSecretKeyHere1234567890
STRIPE_PUBLISHABLE_KEY=pk_test_51OkZxaD5KLHS5j3t9z8xYourActualPublishableKeyHere1234567890
STRIPE_WEBHOOK_SECRET=whsec_1OkZxaD5KLHS5j3t9z8xYourActualWebhookSecretHere
```

---

## Frontend Configuration

### File: `frontend/.env.local`

**Important**: This file should NOT be committed to git (it's in .gitignore)

#### Step 1: Create the File
1. Navigate to `frontend/` folder
2. Create a new file named `.env.local` (note the dot at the start)
3. Add the following content:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Step 2: Add Your Publishable Key

1. Go to Stripe Dashboard: https://dashboard.stripe.com/apikeys
2. Copy the "Publishable key" (starts with `pk_test_`)
3. Replace `YOUR_KEY_HERE` with your actual key:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51OkZxaD5KLHS5j3t9z8xYourActualPublishableKey
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Step 3: Restart Frontend Dev Server
```bash
# Terminal in frontend/
# Stop the dev server (Ctrl+C)
npm run dev
```

#### Example Configuration
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51OkZxaD5KLHS5j3t9z8xYourActualPublishableKeyHere1234567890
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## How to Find Your Keys in Stripe Dashboard

### Step 1: Open API Keys Page
```
1. Log in to https://dashboard.stripe.com
2. Click "Developers" (top left menu)
3. Click "API keys" (submenu)
```

### Step 2: Locate Your Keys
You should see a section like this:

```
┌─────────────────────────────────────────────────┐
│  TEST DATA                                      │
├─────────────────────────────────────────────────┤
│  Publishable key                                │
│  pk_test_51OkZxaD5KLHS5j3t9z8x...   [Copy]    │
├─────────────────────────────────────────────────┤
│  Secret key                                     │
│  sk_test_51OkZxaD5KLHS5j3t9z8x...   [Copy]    │
└─────────────────────────────────────────────────┘
```

---

## Verification Checklist

After setting up your keys, verify everything works:

### ✅ Backend Check
```bash
cd backend/owners_admin

# Start the dev server
npm run dev

# You should see:
# ✓ Stripe initialized successfully
# Server listening on port 5000
```

If you see "Stripe is not configured", your `STRIPE_SECRET_KEY` is missing or incorrect.

### ✅ Frontend Check
```bash
cd frontend

# Start the dev server
npm run dev

# You should see:
# ✓ Stripe library loaded
# Ready in 2.5s
```

If you see "Failed to initialize Stripe", check your `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

### ✅ Payment Flow Test
1. Start both servers (backend + frontend)
2. Navigate to the payment page
3. You should see a card form
4. Try a test payment with card: `4242 4242 4242 4242`

---

## Troubleshooting

### Problem: "Stripe is not configured"
**Appears in**: Backend console  
**Cause**: `STRIPE_SECRET_KEY` is missing or blank  
**Solution**:
1. Open `backend/owners_admin/.env`
2. Check that `STRIPE_SECRET_KEY` is set to a valid `sk_test_...` key
3. Restart backend server: `npm run dev`

### Problem: "Cannot load Stripe library"
**Appears in**: Browser console (F12)  
**Cause**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing or incorrect  
**Solution**:
1. Create or check `frontend/.env.local`
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
3. Restart frontend: `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

### Problem: "Invalid API Key format"
**Appears in**: Browser console or Stripe error  
**Cause**: Key was copied with extra spaces or incomplete  
**Solution**:
1. Go back to Stripe Dashboard
2. Copy the key again carefully
3. Paste it fresh into `.env` file
4. Make sure there are no extra spaces before/after

### Problem: Payment shows 500 error
**Appears in**: When clicking "Complete Payment"  
**Cause**: Backend not configured correctly  
**Solution**:
1. Check backend `.env` has valid `STRIPE_SECRET_KEY`
2. Restart backend server
3. Check backend server logs for specific error
4. Verify network tab (F12) to see actual error response

### Problem: Card form not showing
**Appears in**: Payment page is blank  
**Cause**: Stripe library failed to load  
**Solution**:
1. Check browser console (F12) for errors
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
3. Check network tab to see if Stripe CDN loaded
4. Hard refresh: `Ctrl+Shift+R`

---

## Key Format Reference

### Publishable Key Format
- **Test**: `pk_test_51OkZxaD5KLHS5j3t9z8x...`
- **Live**: `pk_live_51OkZxaD5KLHS5j3t9z8x...`
- ✅ Safe to expose in frontend
- ✅ Safe to commit to git (if test key)
- ✅ Visible in browser network requests

### Secret Key Format
- **Test**: `sk_test_51OkZxaD5KLHS5j3t9z8x...`
- **Live**: `sk_live_51OkZxaD5KLHS5j3t9z8x...`
- ❌ NEVER expose in frontend code
- ❌ NEVER commit to git
- ❌ Backend only!

### Webhook Secret Format
- **Format**: `whsec_1OkZxaD5KLHS5j3t9z8x...`
- ❌ NEVER expose in frontend
- ✅ Backend only (in `.env`)
- ✅ Used for webhook verification

---

## Different Keys for Different Environments

### Development (Test Mode)
Use keys starting with `test_`:
```env
# Backend
STRIPE_SECRET_KEY=sk_test_...

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Production (Live Mode)
Use keys starting with `live_`:
```env
# Backend
STRIPE_SECRET_KEY=sk_live_...

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

To switch from test to live:
1. In Stripe Dashboard, toggle "View test data" to OFF
2. Copy the live keys (they'll appear)
3. Update your environment variables
4. Redeploy your application

---

## Next Steps

1. ✅ Set up your `.env` files (you're here!)
2. → Test a payment with test cards
3. → Complete Stripe account verification
4. → Get live keys when ready
5. → Deploy to production

---

## Still Having Issues?

1. **Check the logs**
   - Backend: Look at terminal output when server starts
   - Frontend: Open browser console (F12) and check for errors

2. **Verify keys are correct**
   - Copy directly from Stripe Dashboard (no manual typing)
   - Use the "Copy" button, not copy-paste from browser

3. **Restart both servers**
   - Stop: Ctrl+C
   - Start: `npm run dev`
   - Wait for confirmation message

4. **Hard refresh browser**
   - Windows/Linux: `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

5. **Check file permissions**
   - Ensure `.env` and `.env.local` are readable by your editor

6. **Still stuck?**
   - Check [STRIPE_SETUP_GUIDE.md](./STRIPE_SETUP_GUIDE.md) for detailed info
   - Check [STRIPE_TECHNICAL_REFERENCE.md](./STRIPE_TECHNICAL_REFERENCE.md) for architecture
   - Visit Stripe support: https://support.stripe.com
