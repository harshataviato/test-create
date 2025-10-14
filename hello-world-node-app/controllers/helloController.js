const MessageModel = require('../models/messageModel');

exports.getHelloWorld = (req, res) => {
  const message = MessageModel.getMessage();
  res.render('hello', { message: message });
};
