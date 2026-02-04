// Vercel serverless function to verify Composio API key connection
// This endpoint checks if COMPOSIO_API_KEY is configured and valid

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

    const apiKey = process.env.COMPOSIO_API_KEY;
    
    // Check if key exists
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        connected: false,
        error: 'COMPOSIO_API_KEY is not configured',
        message: 'The Composio API key is not set in your environment variables.',
        details: {
          keyExists: false,
          keyLength: 0,
          keyPrefix: null,
        },
      });
    }

    // Check key format (basic validation)
    const keyLength = apiKey.length;
    const keyPrefix = apiKey.substring(0, 10);

    // Try to verify the key by making a test API call
    const baseUrl =
      process.env.COMPOSIO_APPS_URL ||
      'https://backend.composio.dev/api/v1/apps';
    
    // Make a minimal API call to verify the key works
    const testUrl = `${baseUrl}?limit=1`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          success: true,
          connected: true,
          message: 'Composio API key is valid and connected successfully!',
          details: {
            keyExists: true,
            keyLength: keyLength,
            keyPrefix: keyPrefix + '...',
            apiEndpoint: baseUrl,
            testResponse: {
              status: response.status,
              statusText: response.statusText,
              hasData: !!data,
            },
          },
        });
      } else {
        const errorText = await response.text();
        return res.status(200).json({
          success: false,
          connected: false,
          error: `Composio API returned error: ${response.status}`,
          message: 'The Composio API key exists but the API call failed.',
          details: {
            keyExists: true,
            keyLength: keyLength,
            keyPrefix: keyPrefix + '...',
            apiEndpoint: baseUrl,
            apiError: {
              status: response.status,
              statusText: response.statusText,
              message: errorText.substring(0, 200), // Limit error message length
            },
          },
        });
      }
    } catch (fetchError) {
      return res.status(200).json({
        success: false,
        connected: false,
        error: 'Failed to connect to Composio API',
        message: 'The API key exists but we could not verify it with Composio servers.',
        details: {
          keyExists: true,
          keyLength: keyLength,
          keyPrefix: keyPrefix + '...',
          apiEndpoint: baseUrl,
          networkError: fetchError.message,
        },
      });
    }
  } catch (error) {
    console.error('❌ Error in /api/verify-composio:', error);
    setCORSHeaders(res, origin);
    return res.status(500).json({
      success: false,
      connected: false,
      error: error.message || 'Failed to verify Composio connection',
    });
  }
};
