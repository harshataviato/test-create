import { Request, Response } from 'express';
import { messageService } from '../models/message.model';

class HelloController {
  public getHelloWorld(req: Request, res: Response): void {
    const message = messageService.getMessage().text;
    res.render('index', { message });
  }
}

export const helloController = new HelloController();
