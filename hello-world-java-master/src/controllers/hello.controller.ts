import { Request, Response } from 'express';
import { MessageModel } from '../models/message.model';

export class HelloController {
  private messageModel: MessageModel;

  constructor() {
    this.messageModel = new MessageModel();
  }

  public getHelloWorld(req: Request, res: Response): void {
    const message = this.messageModel.getHelloWorldMessage();
    res.render('hello', {
      title: 'Hello World App',
      message: message.content
    });
  }
}
