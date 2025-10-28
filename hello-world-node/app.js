const express = require('express');
const path = require('path');
const config = require('./config');
const helloController = require('./src/controllers/helloController');

const app = express();
const port = config.port;

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

app.get('/', helloController.getHelloWorld);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
