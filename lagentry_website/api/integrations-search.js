// Vercel serverless function to proxy Composio app search
// IMPORTANT: This endpoint must never expose COMPOSIO_API_KEY to the client.

// Basic CORS helper (kept in sync with create-checkout-session.js)
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Simple in-memory cache (per serverless instance) to avoid hammering Composio
// Cache key is the normalized search query; TTL defaults to 5 minutes.
const CACHE_TTL_MS = 5 * 60 * 1000;
const integrationsCache = {
  // [queryKey]: { timestamp: number, results: any[] }
};

// Helper to call Composio Apps API
async function fetchComposioApps({ query, limit }) {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) {
    throw new Error('COMPOSIO_API_KEY is not configured on the server');
  }

  // NOTE: Endpoint and query parameters may need to be updated
  // based on your Composio account / API version.
  const baseUrl =
    process.env.COMPOSIO_APPS_URL ||
    'https://backend.composio.dev/api/v1/apps';

  const url = new URL(baseUrl);
  if (query) {
    url.searchParams.set('search', query);
  }
  if (limit) {
    url.searchParams.set('limit', String(limit));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Composio API error (${response.status}): ${text || response.statusText}`
    );
  }

  // Shape of this response depends on Composio's API.
  // We defensively handle both { apps: [...] } and raw array formats.
  const data = await response.json();
  const apps = Array.isArray(data) ? data : Array.isArray(data.apps) ? data.apps : [];

  return apps;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;

  // Handle CORS preflight
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

    const {
      query = '',
      limit: limitParam,
    } = req.query || {};

    const rawQuery = typeof query === 'string' ? query : '';
    const normalizedQuery = rawQuery.trim().toLowerCase();

    // Performance: load top 12 "popular" apps when there is no query
    const limit =
      typeof limitParam === 'string' && !Number.isNaN(Number(limitParam))
        ? Number(limitParam)
        : normalizedQuery ? 24 : 12;

    const cacheKey = `${normalizedQuery || '__popular__'}::${limit}`;
    const now = Date.now();
    const cached = integrationsCache[cacheKey];
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        fromCache: true,
        apps: cached.results,
      });
    }

    // Call Composio API
    const composioApps = await fetchComposioApps({
      query: normalizedQuery || undefined,
      limit,
    });

    // Normalize and project only the fields the frontend needs
    const results = composioApps.map((app) => ({
      app_id: app.id || app.app_id || app.slug || null,
      app_name: app.name || app.app_name || app.title || '',
      description: app.description || app.summary || '',
      logo_url: app.logo_url || app.logoUrl || app.logo || '',
      categories:
        app.categories ||
        app.tags ||
        (app.category ? [app.category] : []),
      auth_type:
        app.auth_type ||
        app.authType ||
        (app.oauth ? 'oauth' : app.api_key ? 'api_key' : null),
    }))
      // Filter out any records without a usable id or name
      .filter((app) => app.app_id && app.app_name);

    // Optional extra filtering on the backend if Composio doesn't support search
    const filteredResults = normalizedQuery
      ? results.filter((app) => {
          const haystack = [
            app.app_name,
            app.description,
            ...(Array.isArray(app.categories) ? app.categories : []),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : results;

    const finalResults = filteredResults.slice(0, limit);

    integrationsCache[cacheKey] = {
      timestamp: now,
      results: finalResults,
    };

    return res.json({
      success: true,
      fromCache: false,
      apps: finalResults,
    });
  } catch (error) {
    console.error('❌ Error in /api/integrations/search:', error);
    setCORSHeaders(res, origin);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to search integrations',
    });
  }
};

