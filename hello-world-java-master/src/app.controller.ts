import { Controller, Get, Res, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HelloWorldEntity } from '../models/hello-world.entity';
import { Response } from 'express';

@ApiTags('Hello World')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get the "Hello world!" message as JSON' })
  @ApiResponse({ status: 200, description: 'Returns the "Hello world!" message.', type: HelloWorldEntity })
  getHelloWorld(): HelloWorldEntity {
    return this.appService.getHelloWorld();
  }

  @Get('/hello-view')
  @Render('index.html')
  @ApiOperation({ summary: 'Render the "Hello world!" HTML view' })
  @ApiResponse({ status: 200, description: 'Serves the "Hello world!" HTML page.' })
  getHelloView(@Res() res: Response) {
    res.sendFile('index.html', { root: 'views' });
  }
}
