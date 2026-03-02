/**
 * Global Error Handling Middleware.
 * 
 * Demonstrates the application's capability to catch exceptions globally
 * and render a friendly UI instead of leaking stack traces to the user.
 */

module.exports = (err, req, res, next) => {
  console.error('[Global Error Handler]', err.stack);

  // Determine response type (API vs HTML)
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }

  // Render friendly error page
  res.status(500).render('error', {
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};
