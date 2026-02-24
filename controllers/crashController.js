export const triggerException = (req, res, next) => {
  next(new Error('Expected: controller used to showcase what happens when an exception is thrown'));
};
