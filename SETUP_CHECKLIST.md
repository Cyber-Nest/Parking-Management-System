# ✅ Stripe Integration Checklist

Print this or keep it open while setting up!

---

## PRE-SETUP (5 minutes)

- [ ] Stripe account created at https://dashboard.stripe.com
- [ ] Email verified
- [ ] Business details completed

---

## GET YOUR KEYS (2 minutes)

- [ ] Logged into https://dashboard.stripe.com
- [ ] Navigated to: Developers → API keys
- [ ] Confirmed "View test data" is ON
- [ ] **Copied Publishable Key** (pk_test_...)
  ```
  Paste here for reference: ________________________
  ```
- [ ] **Copied Secret Key** (sk_test_...)
  ```
  Paste here for reference: ________________________
  ```
- [ ] *(Optional)* Copied Webhook Secret (whsec_...)
  ```
  Paste here for reference: ________________________
  ```

---

## BACKEND CONFIGURATION (1 minute)

- [ ] Located file: `backend/owners_admin/.env`
- [ ] Found section: `# ── Stripe (Payment Processing)`
- [ ] Replaced `STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE`
  ```
  With: sk_test_[paste your key here]
  ```
- [ ] Replaced `STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE`
  ```
  With: pk_test_[paste your key here]
  ```
- [ ] *(Optional)* Replaced `STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE`
  ```
  With: whsec_[paste your key here]
  ```
- [ ] Saved `.env` file (Ctrl+S)

---

## FRONTEND CONFIGURATION (1 minute)

- [ ] Located folder: `frontend/`
- [ ] Created new file: `.env.local` (with dot at start!)
- [ ] Added content:
  ```env
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your key here]
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```
- [ ] Saved `.env.local` file (Ctrl+S)

---

## START SERVERS (1 minute)

**Backend Server:**
- [ ] Opened terminal in `backend/owners_admin/`
- [ ] Stopped any running server (Ctrl+C if needed)
- [ ] Ran: `npm run dev`
- [ ] Confirmed: `Server listening on port 5000`

**Frontend Server:**
- [ ] Opened NEW terminal in `frontend/`
- [ ] Ran: `npm run dev`
- [ ] Confirmed: `Ready in X.Xs`
- [ ] Opened: http://localhost:3000

---

## TEST PAYMENT (2 minutes)

- [ ] Navigated to payment page
- [ ] Saw card form (Stripe Elements)
- [ ] Entered test card number: `4242 4242 4242 4242`
- [ ] Entered expiry: `12/26` (or any future date)
- [ ] Entered CVC: `123` (or any 3 digits)
- [ ] Entered email: `test@example.com`
- [ ] Clicked "Complete Payment"
- [ ] Saw success message ✅

---

## VERIFY IN STRIPE DASHBOARD (1 minute)

- [ ] Opened https://dashboard.stripe.com
- [ ] Went to: Payments → Payments
- [ ] Found your test payment in list
- [ ] Amount shows: $12.50 CAD (or your test amount)
- [ ] Status shows: Succeeded ✅

---

## VERIFY IN DATABASE (1 minute)

- [ ] Opened MySQL Workbench
- [ ] Connected to database: `parksmart`
- [ ] Checked table: `sessions`
- [ ] Found new booking record
- [ ] Confirmed amount and details

---

## DOCUMENTATION READ (optional)

- [ ] Read: `QUICK_REFERENCE.md` ← You are here!
- [ ] Read: `ENV_SETUP_GUIDE.md` (if issues)
- [ ] Read: `STRIPE_SETUP_GUIDE.md` (detailed guide)
- [ ] Read: `STRIPE_TECHNICAL_REFERENCE.md` (how it works)

---

## TROUBLESHOOTING (if needed)

**If you see: "Stripe is not configured"**
- [ ] Check backend `.env` has `STRIPE_SECRET_KEY=sk_test_...`
- [ ] Check it's not empty (no `YOUR_SECRET_KEY_HERE` left)
- [ ] Restart backend server: Ctrl+C then `npm run dev`

**If you see: "Cannot load Stripe"**
- [ ] Check `frontend/.env.local` exists
- [ ] Check it has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- [ ] Restart frontend server: Ctrl+C then `npm run dev`
- [ ] Hard refresh browser: Ctrl+Shift+R

**If payment shows 500 error**
- [ ] Check backend server logs for error message
- [ ] Verify API keys are correct (no typos, no extra spaces)
- [ ] Ensure both servers are running
- [ ] Try hard refresh: Ctrl+Shift+R

**If payment form doesn't show**
- [ ] Open browser console: F12
- [ ] Check for JavaScript errors
- [ ] Verify Stripe library loaded
- [ ] Check network tab for failed requests

---

## COMMON MISTAKES ❌ AVOID

- [ ] ❌ Using `pk_live_` or `sk_live_` keys (use `test_` for now)
- [ ] ❌ Copying keys with extra spaces
- [ ] ❌ Not restarting servers after changing `.env`
- [ ] ❌ Forgetting dot in `.env.local` filename
- [ ] ❌ Putting secret key in frontend code
- [ ] ❌ Committing `.env` files to git

---

## SUCCESS INDICATORS ✅

You'll know it's working when:

- ✅ Backend server starts without errors
- ✅ Frontend loads payment page with card form
- ✅ Test card payment is accepted
- ✅ Success message appears
- ✅ Payment shows in Stripe Dashboard
- ✅ Booking record created in database

---

## NEXT STEPS

**Immediate:**
1. ✅ Test a few more payments
2. ✅ Try failed card (4000 0000 0000 0002) to see error handling
3. ✅ Check booking records are created correctly

**This Week:**
4. Test refund functionality (if available)
5. Test receipt generation
6. Load test with multiple payments

**Before Going Live:**
7. Complete Stripe account verification (24-48 hours)
8. Set up webhook notifications
9. Configure payment email receipts
10. Get live API keys

**Going Live:**
11. Switch to live keys (sk_live_ and pk_live_)
12. Increase security (SSL, rate limiting, etc.)
13. Set up monitoring and alerts
14. Deploy to production

---

## KEEP THESE SAFE

```
Your Test Keys (keep secret!):
Publishable Key: pk_test________________________
Secret Key:      sk_test________________________
Webhook Secret:  whsec_________________________

Your Live Keys (when ready - EXTRA SECRET!):
Publishable Key: pk_live________________________
Secret Key:      sk_live________________________
Webhook Secret:  whsec_________________________
```

---

## QUICK HELP

| Issue | Link |
|-------|------|
| Can't find keys | https://dashboard.stripe.com/apikeys |
| Payment failed | Check test card number in this doc |
| Stripe docs | https://stripe.com/docs |
| Support | https://support.stripe.com |

---

## NOTES

Use this space for your own notes:

```
_________________________________________________

_________________________________________________

_________________________________________________

_________________________________________________
```

---

## COMPLETION SUMMARY

**Date Completed**: _______________

**Issues Encountered**: _______________

**Time Taken**: _______________

**Notes**: _______________________________________________

---

**🎉 Congratulations! Your payment system is ready!**

You can now:
- ✅ Accept payments from customers
- ✅ Create parking bookings
- ✅ Generate receipts
- ✅ Track transactions

Next: Read other guides for advanced features.
