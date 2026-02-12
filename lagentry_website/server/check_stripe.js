require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRODUCT_IDS = {
    'hobby-20': process.env.STRIPE_PRODUCT_ID_HOBBY || 'prod_TxcJtZEyPA6dAD',
    'startup-80': process.env.STRIPE_PRODUCT_ID_STARTUP || 'prod_TxcLGi35KmdqUh',
    'growth-100': process.env.STRIPE_PRODUCT_ID_GROWTH || 'prod_TxcM6LSDsyxmEL',
};

async function checkProducts() {
    console.log('🔍 Checking Stripe configuration...');

    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('❌ STRIPE_SECRET_KEY is missing in .env');
        return;
    }

    const isTestKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    console.log(`🔑 Using Stripe Key: ${isTestKey ? 'TEST MODE' : 'LIVE MODE'} (${process.env.STRIPE_SECRET_KEY.slice(0, 8)}...)`);

    for (const [planName, productId] of Object.entries(PRODUCT_IDS)) {
        console.log(`\n📦 Checking product: ${planName} (${productId})`);
        try {
            const product = await stripe.products.retrieve(productId);
            console.log(`   ✅ Product found: ${product.name} (Active: ${product.active})`);

            const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 });
            console.log(`   💰 Found ${prices.data.length} active prices:`);
            prices.data.forEach(p => {
                console.log(`      - ${p.id}: ${p.unit_amount / 100} ${p.currency.toUpperCase()} / ${p.recurring?.interval}`);
            });

            if (prices.data.length === 0) {
                console.warn(`   ⚠️ No active prices found for this product!`);
            }
        } catch (error) {
            console.error(`   ❌ Error fetching product: ${error.message}`);
            if (error.code === 'resource_missing') {
                console.error(`      -> This product ID does not exist in the current Stripe environment.`);
                console.error(`      -> Ensure you are using the correct API Key (Test vs Live) and Product ID.`);
            }
        }
    }
}

checkProducts();
