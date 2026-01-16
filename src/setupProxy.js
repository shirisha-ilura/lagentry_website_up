const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only proxy API requests, not static files
  // Static files in public folder are served directly by the dev server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      timeout: 30000, // 30 second timeout
      proxyTimeout: 30000,
      onError: (err, req, res) => {
        console.log('Proxy error:', err.message);
        // Don't crash the app if backend is unavailable
        if (!res.headersSent) {
          res.status(503).json({ error: 'Backend service unavailable' });
        }
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxy requests for debugging
        console.log('Proxying request to backend:', req.method, req.url);
      },
    })
  );
  
  // Don't proxy other routes - let React Router handle them
  // This prevents 504 errors on non-API routes
};

