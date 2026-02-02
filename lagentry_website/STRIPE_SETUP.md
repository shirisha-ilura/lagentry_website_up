# Stripe Integration Setup Guide

## Overview
This guide explains how to set up Stripe payment integration for the Lagentry pricing page.

## Prerequisites
1. Stripe account (get credentials from Sakshi)
2. Access to Vercel environment variables

## Step 1: Get Stripe Credentials
Contact Sakshi to get:
- **Stripe Secret Key** (starts with `sk_`)
- **Stripe Publishable Key** (starts with `pk_`) - Optional for frontend if needed later

## Step 2: Create Products and Prices in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create products for each plan:
   - **Hobby Plan** - $20/month
   - **Startup Plan** - $80/month
   - **Growth Plan** - $100/month

3. For each product, create two prices:
   - Monthly subscription price
   - Yearly subscription price (10x monthly price)

4. Copy the Price IDs (they start with `price_`)

## Step 3: Set Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and add:

### Required Variables:
```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
```

### Optional Price ID Variables (if not using defaults):
```
STRIPE_PRICE_ID_HOBBY_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_HOBBY_YEARLY=price_xxxxx
STRIPE_PRICE_ID_STARTUP_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_STARTUP_YEARLY=price_xxxxx
STRIPE_PRICE_ID_GROWTH_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_GROWTH_YEARLY=price_xxxxx
```

**Note:** If you don't set the price ID variables, you'll need to update the `PRICE_IDS` object in `api/create-checkout-session.js` with your actual Stripe price IDs.

## Step 4: Install Stripe Package

The Stripe package is already added to `api/package.json`. After deployment, Vercel will automatically install it.

For local testing, run:
```bash
cd api
npm install
```

## Step 5: Test the Integration

1. Use Stripe test mode keys for testing
2. Test the checkout flow:
   - Go to `/pricing`
   - Click "Get Started" on a paid plan
   - Complete test checkout with card: `4242 4242 4242 4242`
   - Should redirect to `/checkout-success` then `/dashboard`

## Flow Overview

1. **User clicks "Get Started"** on pricing page
2. **Frontend calls** `/api/create-checkout-session` with plan details
3. **Backend creates** Stripe checkout session
4. **User redirected** to Stripe checkout page
5. **After payment**, Stripe redirects to `/checkout-success?session_id=xxx`
6. **Success page** redirects to `/dashboard` after 2 seconds

## Troubleshooting

### "Payment processing is not configured"
- Check that `STRIPE_SECRET_KEY` is set in Vercel environment variables
- Redeploy after adding environment variables

### "Invalid plan" error
- Check that price IDs are correctly set in environment variables or `create-checkout-session.js`
- Verify plan IDs match: `hobby-20`, `startup-80`, `growth-100`

### Checkout session not created
- Check Vercel function logs for errors
- Verify Stripe secret key is valid
- Ensure price IDs exist in Stripe dashboard

## Support
For issues, contact Sakshi or check Stripe Dashboard logs.
