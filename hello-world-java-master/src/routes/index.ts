import { Router } from 'express';
import { HelloController } from '../controllers/hello.controller';

const router = Router();
const helloController = new HelloController();

router.get('/', helloController.getHelloWorld);

export default router;
