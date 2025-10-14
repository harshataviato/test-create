const express = require('express');
const path = require('path');
const helloController = require('./controllers/helloController');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', helloController.getHelloWorld);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
