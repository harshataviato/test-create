export interface Message {
  content: string;
}

export class MessageModel {
  public getHelloWorldMessage(): Message {
    return { content: "Hello world from TypeScript!" };
  }
}
