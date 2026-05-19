# Stripe Payment Integration - Technical Reference

## Overview

The ParkSmart application uses Stripe for secure payment processing. This document details the technical architecture and implementation.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Customer Browser                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Payment Page (Next.js + Stripe)                 │ │
│  │                                                             │ │
│  │  1. Load Stripe Elements with publishable key              │ │
│  │  2. Request payment intent from backend                    │ │
│  │  3. Display card form to customer                          │ │
│  │  4. Confirm payment with Stripe                            │ │
│  │  5. Send booking to backend                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────┬──────────────────────┘
                                           │ HTTP
                                           ↓
┌──────────────────────────────────────────────────────────────────┐
│                    ParkSmart Backend API                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  POST /api/customer/payment-intents                        │  │
│  │  - Receives amount from frontend                           │  │
│  │  - Creates Stripe PaymentIntent with secret key           │  │
│  │  - Returns clientSecret to frontend                       │  │
│  │                                                             │  │
│  │  POST /api/customer/bookings                              │  │
│  │  - Receives booking details + Stripe Payment Intent ID    │  │
│  │  - Verifies payment with Stripe                           │  │
│  │  - Creates booking in database                            │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────┬──────────────────────┘
                                           │ HTTPS
                                           ↓
            ┌──────────────────────────────────────┐
            │    Stripe API (stripe.com)           │
            │                                      │
            │  - Create PaymentIntent              │
            │  - Confirm Card Payment              │
            │  - Store Payment Method              │
            │  - Send Webhooks                     │
            └──────────────────────────────────────┘
```

---

## Payment Flow - Step by Step

### Phase 1: Initialize Payment Intent

```
1. Customer navigates to payment page
   ↓
2. Frontend calls: POST /api/customer/payment-intents
   - Headers: Authorization: Bearer <JWT_TOKEN>
   - Body: { amount: 12.50 }
   ↓
3. Backend service (CustomerService):
   - Validates amount > 0
   - Calls stripe.paymentIntents.create()
   - Amount converted to cents: 12.50 * 100 = 1250
   - Currency: CAD
   - Returns clientSecret to frontend
   ↓
4. Frontend receives clientSecret and stores in state
```

### Phase 2: Customer Enters Card Details

```
1. Stripe Elements loads card form
   - Uses publishable key (safe to expose)
   - Communicates directly with Stripe
   - Never sends raw card data to backend
   ↓
2. Customer enters:
   - Card number
   - Expiry date
   - CVC code
```

### Phase 3: Confirm Payment

```
1. Customer clicks "Complete Payment"
   ↓
2. Frontend calls: stripe.confirmCardPayment(clientSecret, {...})
   - Sends card data to Stripe (not to backend)
   - Stripe processes the payment
   ↓
3. Stripe returns payment result:
   - Status: "succeeded" or "failed"
   - PaymentIntent ID
   ↓
4. If successful, frontend calls: POST /api/customer/bookings
   - Headers: Authorization: Bearer <JWT_TOKEN>
   - Body: {
       zoneId: "zone-123",
       email: "customer@example.com",
       licensePlate: "ABC123",
       stripePaymentIntentId: "pi_1234567890",
       ...
     }
```

### Phase 4: Complete Booking

```
1. Backend receives booking request
   ↓
2. CustomerService.createBooking():
   - Retrieves PaymentIntent from Stripe using ID
   - Verifies payment status === "succeeded"
   - Checks parking zone availability
   - Creates session record in database
   - Returns booking confirmation
   ↓
3. Frontend displays success message
   ↓
4. Booking is complete!
```

---

## Key Files & Components

### Backend

#### [src/config/env.ts](../backend/owners_admin/src/config/env.ts)
Loads Stripe configuration from environment variables:
```typescript
stripe: {
  secretKey: optional('STRIPE_SECRET_KEY', ''),
}
```

#### [src/services/customer.service.ts](../backend/owners_admin/src/services/customer.service.ts)
Main payment logic:

```typescript
export class CustomerService {
  // Create payment intent for amount
  async createPaymentIntent(amount: number) {
    return stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'cad',
      payment_method_types: ['card'],
    });
  }

  // Complete booking after payment
  async createBooking(payload: CustomerBookingPayload) {
    // Verify payment succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payload.stripePaymentIntentId
    );
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not completed');
    }
    // Create booking...
  }
}
```

#### [src/controllers/customer.controller.ts](../backend/owners_admin/src/controllers/customer.controller.ts)
HTTP endpoints:

```typescript
export const createPaymentIntent = async (req, res) => {
  const { amount } = req.body;
  const data = await customerService.createPaymentIntent(amount);
  res.json({ success: true, data });
};
```

#### [src/routes/customer.routes.ts](../backend/owners_admin/src/routes/customer.routes.ts)
Route definitions:

```typescript
router.post('/payment-intents', createPaymentIntent);
router.post('/bookings', createBooking);
```

### Frontend

#### [src/lib/axios.ts](../frontend/src/lib/axios.ts)
Axios client with JWT interceptor:
```typescript
axiosInstance.interceptors.request.use((config) => {
  const token = getTokenValue('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### [src/services/customer.service.ts](../frontend/src/services/customer.service.ts)
API client:

```typescript
export class CustomerService {
  async createPaymentIntent(amount: number) {
    const response = await axios.post(
      API_ENDPOINTS.CUSTOMER.PAYMENT_INTENT,
      { amount }
    );
    return response.data?.data;
  }

  async submitBooking(payload, stripePaymentIntentId) {
    const response = await axios.post(
      API_ENDPOINTS.CUSTOMER.BOOKINGS,
      { ...payload, stripePaymentIntentId }
    );
    return response.data?.data;
  }
}
```

#### [src/app/(customer)/payment/page.tsx](../frontend/src/app/(customer)/payment/page.tsx)
Payment UI component:

```typescript
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

function CheckoutForm({ bookingSummary }) {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Load payment intent
    const intent = await customerService.createPaymentIntent(
      bookingSummary.total
    );
    setClientSecret(intent.clientSecret);
  }, [bookingSummary]);

  const handlePayment = async () => {
    // Confirm card payment with Stripe
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    // Submit booking to backend
    await customerService.submitBooking(payload, result.paymentIntent.id);
  };

  return (
    <Elements stripe={stripePromise}>
      <CardElement /> {/* Stripe's card form */}
      <button onClick={handlePayment}>Complete Payment</button>
    </Elements>
  );
}
```

---

## Environment Variables

### Backend (.env)
```env
# Stripe API Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_51...        # Secret key - NEVER expose
STRIPE_PUBLISHABLE_KEY=pk_test_51...   # Public key - safe for frontend
STRIPE_WEBHOOK_SECRET=whsec_...        # For webhook verification
```

### Frontend (.env.local)
```env
# Publishable key only (safe to expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Security Considerations

### ✅ DO:
- Keep secret keys in backend `.env` only
- Use HTTPS in production
- Validate amounts on backend
- Verify PaymentIntent status before completing booking
- Use JWT tokens for API authentication
- Implement rate limiting on payment endpoints
- Store payment receipts securely
- Monitor Stripe dashboard for unusual activity

### ❌ DON'T:
- Hardcode Stripe keys in source code
- Expose secret keys in frontend
- Commit `.env` files to version control
- Log sensitive payment information
- Store raw card data (Stripe handles this)
- Skip PCI compliance requirements

---

## Error Handling

### Common Errors

#### 500 Error: "Stripe is not configured"
**Cause**: `STRIPE_SECRET_KEY` not set  
**Solution**: Add to backend `.env`

#### 401 Unauthorized on payment-intents
**Cause**: Missing JWT token  
**Solution**: Ensure user is logged in

#### "Cannot read stripe keys in frontend"
**Cause**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` not set  
**Solution**: Add to `frontend/.env.local` and restart dev server

#### "Payment declined"
**Cause**: Card validation failed  
**Possible reasons**:
- Insufficient funds (use test card `4242...`)
- Incorrect CVC/Expiry
- Card reported as fraudulent

#### "Payment intent status is not succeeded"
**Cause**: Payment not completed before booking submission  
**Solution**: Ensure `confirmCardPayment` completes successfully

---

## Testing

### Test Cards

| Purpose | Card Number | Exp | CVC | Result |
|---------|-------------|-----|-----|--------|
| Success | `4242 4242 4242 4242` | `12/26` | `123` | ✅ Succeeds |
| Decline | `4000 0000 0000 0002` | `12/26` | `123` | ❌ Card declined |
| CVC Error | `4000 0000 0000 0127` | `12/26` | `123` | ❌ CVC fails |
| 3D Secure | `4000 0025 0000 3155` | `12/26` | `123` | 🔒 Auth required |

### Testing Flow

1. Start both servers:
   ```bash
   # Backend
   cd backend/owners_admin && npm run dev

   # Frontend
   cd frontend && npm run dev
   ```

2. Navigate to payment page
3. Enter test card details
4. Check Stripe dashboard for payment record
5. Verify booking created in database

---

## Webhook Integration (Optional)

Webhooks allow Stripe to notify your backend of payment events asynchronously.

### Webhook Events

```typescript
// Example: payment_intent.succeeded
{
  type: 'payment_intent.succeeded',
  data: {
    object: {
      id: 'pi_1234567890',
      status: 'succeeded',
      amount: 1250,  // in cents
      currency: 'cad',
      customer: 'cus_123456',
      metadata: { source: 'customer_booking' }
    }
  }
}
```

### Setting Up Webhooks

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Add `STRIPE_WEBHOOK_SECRET` to backend `.env`
5. Implement webhook handler in backend

---

## Production Checklist

- [ ] Complete Stripe account verification
- [ ] Request live API keys from Stripe
- [ ] Update backend `.env` with `sk_live_` keys
- [ ] Update frontend `.env` with `pk_live_` keys
- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Set up webhooks for payment notifications
- [ ] Configure automated payouts to bank account
- [ ] Test with real payment card
- [ ] Monitor Stripe dashboard regularly
- [ ] Document refund/dispute policies

---

## Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Payment Intents API**: https://stripe.com/docs/payments/payment-intents
- **React Stripe Library**: https://stripe.com/docs/stripe-js/react
- **Testing Guide**: https://stripe.com/docs/testing
- **Dashboard**: https://dashboard.stripe.com

---

## Support

For issues:
1. Check Stripe dashboard logs
2. Review error details in browser console
3. Check backend server logs
4. Contact Stripe support: https://support.stripe.com
