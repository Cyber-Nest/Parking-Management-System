# 📍 File Location Guide

This guide shows you exactly where to find and edit each file.

---

## 🔧 Configuration Files You Need to Edit

### Backend Configuration
```
your-project-folder/
│
└── backend/
    └── owners_admin/
        └── .env                          ← EDIT THIS FILE
            
WHERE TO FIND IT:
- Open VS Code
- Press Ctrl+P (Quick Open)
- Type: .env
- Select: backend/owners_admin/.env

WHAT TO ADD:
Scroll to bottom and find section:
# ── Stripe (Payment Processing) ──────────────────────────

Replace:
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
            ↓
STRIPE_SECRET_KEY=sk_test_51OkZxaD5KLHS5j3t9z8xYourKeyHere

Replace:
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
            ↓
STRIPE_PUBLISHABLE_KEY=pk_test_51OkZxaD5KLHS5j3t9z8xYourKeyHere

(Webhook secret is optional for now)
```

### Frontend Configuration
```
your-project-folder/
│
└── frontend/
    └── .env.local                       ← CREATE THIS FILE (if missing)

WHERE TO CREATE IT:
- Open VS Code
- Right-click on "frontend" folder
- Select: New File
- Name it: .env.local (with dot!)

WHAT TO PUT IN IT:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_API_URL=http://localhost:5000/api

(Only add your actual publishable key, not secret key!)
```

---

## 📖 Documentation Files Created

```
your-project-folder/
├── QUICK_REFERENCE.md                 ← Shortest guide
├── SETUP_CHECKLIST.md                 ← Print this out!
├── ENV_SETUP_GUIDE.md                 ← Detailed env setup
├── STRIPE_QUICK_START.md              ← 5-minute guide
├── STRIPE_SETUP_GUIDE.md              ← Complete guide
├── STRIPE_TECHNICAL_REFERENCE.md      ← How it works
├── STRIPE_SETUP_COMPLETE.md           ← Summary
└── FILE_LOCATION_GUIDE.md             ← This file!

WHICH ONE TO READ:
- In a hurry? → QUICK_REFERENCE.md
- Need help? → ENV_SETUP_GUIDE.md
- Want all details? → STRIPE_SETUP_GUIDE.md
- How does it work? → STRIPE_TECHNICAL_REFERENCE.md
- Just an overview? → STRIPE_QUICK_START.md
```

---

## 💻 Source Code Files (Already Implemented)

```
your-project-folder/

BACKEND (Stripe API calls):
│
└── backend/
    └── owners_admin/
        └── src/
            ├── config/
            │   └── env.ts                         ← Reads STRIPE_SECRET_KEY
            │
            ├── services/
            │   └── customer.service.ts            ← Creates PaymentIntent
            │
            └── controllers/
                └── customer.controller.ts         ← HTTP endpoints

FRONTEND (Stripe UI):
│
└── frontend/
    └── src/
        ├── services/
        │   └── customer.service.ts                ← Calls payment API
        │
        ├── app/
        │   └── (customer)/
        │       └── payment/
        │           └── page.tsx                   ← Payment form
        │
        └── lib/
            └── axios.ts                           ← API client

YOU DON'T NEED TO EDIT THESE - They're already done!
Just add the Stripe keys to the .env files above.
```

---

## 🔑 Getting Your Stripe Keys

```
STEP 1: Go to Stripe Dashboard
   https://dashboard.stripe.com

STEP 2: Click "Developers" in top menu
   
STEP 3: Click "API keys" in submenu
   Look for:
   ┌────────────────────────────────┐
   │ TEST DATA                      │
   ├────────────────────────────────┤
   │ Publishable key                │
   │ pk_test_51OkZxaD5KLHS5j3t9z8x_ │
   │                        [Copy]  │
   ├────────────────────────────────┤
   │ Secret key                     │
   │ sk_test_51OkZxaD5KLHS5j3t9z8x_ │
   │                        [Copy]  │
   └────────────────────────────────┘

STEP 4: Copy & Paste to your .env files
   (See above for which goes where)
```

---

## 📂 Complete File Tree

```
Parking-Management-System/
│
├── 📄 README.md
├── 📄 QUICK_REFERENCE.md               ⭐ Start here!
├── 📄 SETUP_CHECKLIST.md               ⭐ Print this!
├── 📄 ENV_SETUP_GUIDE.md
├── 📄 STRIPE_SETUP_GUIDE.md
├── 📄 STRIPE_QUICK_START.md
├── 📄 STRIPE_TECHNICAL_REFERENCE.md
├── 📄 STRIPE_SETUP_COMPLETE.md
├── 📄 FILE_LOCATION_GUIDE.md           ← You are here
│
├── backend/
│   └── owners_admin/
│       ├── 📄 .env                     ⭐ ADD STRIPE KEYS HERE
│       ├── 📄 package.json
│       ├── 📄 tsconfig.json
│       │
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.ts
│       │   │   └── env.ts              ← Reads STRIPE_SECRET_KEY
│       │   │
│       │   ├── controllers/
│       │   │   └── customer.controller.ts
│       │   │
│       │   ├── services/
│       │   │   └── customer.service.ts ← Payment logic
│       │   │
│       │   ├── routes/
│       │   └── models/
│       │
│       └── scripts/
│           ├── init-db.js
│           └── migrate-db.js
│
└── frontend/
    ├── 📄 .env.local                   ⭐ CREATE & ADD KEY HERE
    ├── 📄 .env.local.example           ← Template reference
    ├── 📄 package.json
    ├── 📄 tsconfig.json
    │
    └── src/
        ├── services/
        │   └── customer.service.ts     ← API calls
        │
        ├── app/
        │   ├── (customer)/
        │   │   └── payment/
        │   │       └── page.tsx        ← Payment page
        │   │
        │   └── layout.tsx
        │
        ├── lib/
        │   └── axios.ts                ← API client
        │
        └── contexts/
            └── CustomerParkingContext.tsx
```

---

## ⚡ Quick File Edit Guide

### To Edit backend/.env:

**Method 1: VS Code Explorer**
```
1. Open VS Code
2. Left sidebar → Explorer
3. Navigate: backend → owners_admin → .env
4. Click .env file
5. Find the Stripe section at the bottom
6. Edit the three lines
7. Save (Ctrl+S)
```

**Method 2: Quick Open (Faster)**
```
1. Press Ctrl+P
2. Type: .env
3. Click: backend/owners_admin/.env
4. Edit and save
```

**Method 3: File Manager**
```
1. Windows Explorer
2. Navigate to: backend/owners_admin/
3. Right-click .env
4. Open with VS Code
5. Edit and save
```

### To Create frontend/.env.local:

**Method 1: VS Code**
```
1. Open VS Code
2. Right-click on "frontend" folder
3. Click "New File"
4. Type: .env.local
5. Add your content
6. Save (Ctrl+S)
```

**Method 2: File Manager**
```
1. Windows Explorer
2. Navigate to: frontend/
3. Right-click empty space
4. New → Text Document
5. Name it: .env.local
6. Add your content
7. Save
```

**Method 3: Command Line**
```
cd frontend
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..." > .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" >> .env.local
```

---

## 🔍 Finding Things in VS Code

### Quick Open (Ctrl+P)
```
Type what you're looking for:
- .env              → Find .env files
- payment.          → Find payment files
- customer.service  → Find customer service
- stripe            → Find anything with "stripe"
```

### Find in Files (Ctrl+Shift+F)
```
Search across all files:
- STRIPE_SECRET_KEY → Find where it's used
- payment_intents   → Find payment endpoints
- createPaymentIntent → Find payment creation
```

### Go to File (Ctrl+P)
```
Type full path:
- backend/owners_admin/.env
- frontend/src/app/(customer)/payment/page.tsx
- backend/owners_admin/src/services/customer.service.ts
```

---

## 📋 Verification Checklist

After editing, verify:

```
Backend .env file:
  ✓ Has STRIPE_SECRET_KEY=sk_test_...
  ✓ Has STRIPE_PUBLISHABLE_KEY=pk_test_...
  ✓ No "YOUR_SECRET_KEY_HERE" text remaining
  ✓ File is saved (no dot in tab)

Frontend .env.local file:
  ✓ File name is .env.local (with dot!)
  ✓ Has NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ✓ Has NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ✓ File is saved (no dot in tab)
  ✓ File is NOT .env.local.example (different file!)

Servers:
  ✓ Both servers restarted after changes
  ✓ Backend shows "Server listening on port 5000"
  ✓ Frontend shows "Ready in X.Xs"
```

---

## 🆘 If You Can't Find a File

**Files are hidden?**
```
VS Code:
  - Press Ctrl+H to toggle hidden files
  - .env files should appear

Windows Explorer:
  - View → Hidden items ✓
  - Files starting with . should appear
```

**Wrong location?**
```
Use Ctrl+P in VS Code to quickly navigate to any file
Just type the filename and it will find it!
```

**File permissions?**
```
Windows:
  - Right-click file → Properties
  - Security tab
  - Your user should have "Full Control"

Mac/Linux:
  - chmod 644 .env
```

---

## 📞 Quick Support

| Problem | Solution |
|---------|----------|
| Can't find .env | Use Ctrl+P in VS Code to search |
| File won't save | Check file permissions, try Save As |
| Keys not working | Verify exact copy from Stripe Dashboard |
| Server won't start | Check .env syntax (no extra spaces) |
| Changes not taking effect | Restart server after editing .env |

---

## Next Steps

1. ✅ Find your backend .env file (see above)
2. ✅ Find your frontend .env.local file (or create it)
3. ✅ Get your keys from Stripe Dashboard
4. ✅ Add keys to the files
5. ✅ Restart both servers
6. ✅ Test a payment
7. ✅ Read the other guides if needed

---

**You're all set! Now go configure your payment system! 💳**
