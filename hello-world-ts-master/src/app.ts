import express, { Application } from 'express';
import path from 'path';
import { helloController } from './controllers/hello.controller';

const app: Application = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', helloController.getHelloWorld);

export default app;
