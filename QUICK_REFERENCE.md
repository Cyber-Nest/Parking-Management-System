# 🚀 Quick Reference - Stripe Setup

## Your Error (Solved!)
```
❌ AxiosError: Request failed with status code 500
   at CustomerService.createPaymentIntent
```

**Reason**: `STRIPE_SECRET_KEY` not found in `.env`

---

## Fix in 60 Seconds

### 1️⃣ Get Keys (2 min)
```
→ Go to: https://dashboard.stripe.com/apikeys
→ Copy: pk_test_... (Publishable Key)
→ Copy: sk_test_... (Secret Key)
```

### 2️⃣ Backend Config (30 sec)
Edit `backend/owners_admin/.env`:
```env
STRIPE_SECRET_KEY=sk_test_PASTE_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_HERE
STRIPE_WEBHOOK_SECRET=whsec_PASTE_HERE
```

### 3️⃣ Frontend Config (30 sec)
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_HERE
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4️⃣ Restart (30 sec)
```bash
# Backend terminal - press Ctrl+C then:
npm run dev

# Frontend terminal - press Ctrl+C then:
npm run dev
```

**Done!** ✅ Your payment system is live.

---

## Test It

**Card**: 4242 4242 4242 4242  
**Expiry**: 12/26  
**CVC**: 123  

Should see: ✅ Payment successful!

---

## Documentation Map

| Need | Document | Time |
|------|----------|------|
| Just do it | This page | 2 min |
| Setup help | `ENV_SETUP_GUIDE.md` | 5 min |
| Full guide | `STRIPE_SETUP_GUIDE.md` | 15 min |
| How it works | `STRIPE_TECHNICAL_REFERENCE.md` | 20 min |
| Quick overview | `STRIPE_QUICK_START.md` | 5 min |

---

## Stripe Dashboard Location

```
https://dashboard.stripe.com
    ↓
Click "Developers" (top menu)
    ↓
Click "API keys" (submenu)
    ↓
Copy keys (TEST DATA section)
```

---

## Environment File Locations

```
backend/owners_admin/
└── .env                           ← Add STRIPE keys

frontend/
└── .env.local                     ← Add STRIPE key (create if missing)
```

---

## Key Formats

```
Publishable Key:  pk_test_51OkZxaD5KLHS5j3t9z8x...
Secret Key:       sk_test_51OkZxaD5KLHS5j3t9z8x...
Webhook Secret:   whsec_1OkZxaD5KLHS5j3t9z8x...
```

**⚠️ Only expose Publishable Key in frontend!**

---

## Verify It Works

✅ Backend shows: `Server listening on port 5000`  
✅ Frontend shows: `Ready in X.Xs`  
✅ Payment page loads card form  
✅ Test payment succeeds  

---

## After Setup

1. Test with test cards (above)
2. Check Stripe Dashboard for payment records
3. Verify bookings created in database
4. You're ready!

---

## When Going Live

Just swap test keys for live keys:
- `sk_test_` → `sk_live_`
- `pk_test_` → `pk_live_`

That's it! 🎉

---

## Still Having Issues?

1. **Check backend console** - Any Stripe errors?
2. **Check browser console** (F12) - Any JavaScript errors?
3. **Verify keys are correct** - Copy from Stripe Dashboard only
4. **Hard refresh** - Ctrl+Shift+R
5. **Restart both servers** - Kill terminal and `npm run dev`

---

## What's Implemented

✅ Payment intent creation  
✅ Card form validation  
✅ Payment confirmation  
✅ Booking submission  
✅ Error handling  
✅ Success messaging  

All ready to go! Just add your keys.

---

**Questions? Check the full guides in the root folder.**
