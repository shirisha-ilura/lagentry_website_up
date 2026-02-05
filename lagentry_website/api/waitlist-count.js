const { sql } = require('@vercel/postgres');

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

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, origin);
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    setCORSHeaders(res, origin);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    setCORSHeaders(res, origin);

    // Count waitlist leads in Neon / Vercel Postgres
    const result = await sql`
      SELECT COUNT(*)::int AS count
      FROM leads
      WHERE source = 'waitlist';
    `;

    const dbCount = result?.rows?.[0]?.count || 0;

    // Optional base number for marketing (matches existing copy: 5,784)
    const BASE_WAITLIST_COUNT = 5784;
    const displayCount = BASE_WAITLIST_COUNT + dbCount;

    return res.status(200).json({
      success: true,
      count: dbCount,
      base: BASE_WAITLIST_COUNT,
      displayCount,
    });
  } catch (error) {
    console.error('❌ Error in /api/waitlist-count:', error);
    setCORSHeaders(res, origin);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to load waitlist count',
    });
  }
};

