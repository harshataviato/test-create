exports.triggerException = (req, res, next) => {
  // Simulate an error to demonstrate error page handling
  next(new Error("Expected: controller used to showcase what happens when an exception is thrown"));
};
