const helloModel = require('../models');

exports.getHelloWorld = (req, res) => {
  const data = helloModel.getMessage();
  res.render('hello', { message: data.text });
};
