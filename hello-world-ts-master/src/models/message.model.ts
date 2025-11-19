interface IMessage {
  text: string;
}

class MessageService {
  private message: IMessage;

  constructor() {
    this.message = { text: "Hello world from TypeScript!" };
  }

  public getMessage(): IMessage {
    return this.message;
  }
}

export const messageService = new MessageService();
