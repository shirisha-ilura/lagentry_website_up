// Vercel serverless function to create Stripe checkout session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// CORS headers
function setCORSHeaders(res, origin) {
  const allowedOrigins = [
    'https://lagentry.com',
    'https://www.lagentry.com',
    'https://aganret.com',
    'https://www.aganret.com',
    'http://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Price IDs mapping (these need to be created in Stripe Dashboard)
const PRICE_IDS = {
  'hobby-20-monthly': process.env.STRIPE_PRICE_ID_HOBBY_MONTHLY || 'price_hobby_monthly',
  'hobby-20-yearly': process.env.STRIPE_PRICE_ID_HOBBY_YEARLY || 'price_hobby_yearly',
  'startup-80-monthly': process.env.STRIPE_PRICE_ID_STARTUP_MONTHLY || 'price_startup_monthly',
  'startup-80-yearly': process.env.STRIPE_PRICE_ID_STARTUP_YEARLY || 'price_startup_yearly',
  'growth-100-monthly': process.env.STRIPE_PRICE_ID_GROWTH_MONTHLY || 'price_growth_monthly',
  'growth-100-yearly': process.env.STRIPE_PRICE_ID_GROWTH_YEARLY || 'price_growth_yearly',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);

    const { planId, isYearly, email } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required',
      });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Stripe secret key not configured');
      return res.status(500).json({
        success: false,
        error: 'Payment processing is not configured. Please contact support.',
      });
    }

    // Get the price ID based on plan and billing period
    const priceKey = `${planId}-${isYearly ? 'yearly' : 'monthly'}`;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan: ${planId}`,
      });
    }

    // Get base URL for success/cancel URLs
    const baseUrl = process.env.FRONTEND_URL || 
                   (origin ? new URL(origin).origin : 'https://lagentry.com');

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: email || undefined,
      metadata: {
        planId,
        isYearly: isYearly ? 'true' : 'false',
      },
    });

    console.log('✅ Stripe checkout session created:', session.id);

    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Error creating Stripe checkout session:', error);
    const origin = req.headers.origin;
    setCORSHeaders(res, origin);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
