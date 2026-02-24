/**
 * Simulates a server crash/error.
 */
exports.triggerException = (req, res, next) => {
  throw new Error("Expected: controller used to showcase what happens when an exception is thrown");
};
