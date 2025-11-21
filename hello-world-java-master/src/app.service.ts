import { Injectable } from '@nestjs/common';
import { HelloWorldEntity } from '../models/hello-world.entity';

@Injectable()
export class AppService {
  getHelloWorld(): HelloWorldEntity {
    return { message: 'Hello world!' };
  }
}
