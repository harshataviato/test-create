/**
 * Intentionally throws an exception to test error handling pages.
 */
exports.triggerException = (req, res) => {
  throw new Error('Expected: controller used to showcase what happens when an exception is thrown');
};
