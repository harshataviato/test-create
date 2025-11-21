import { ApiProperty } from '@nestjs/swagger';

export class HelloWorldEntity {
  @ApiProperty({ description: 'The "Hello world!" message', example: 'Hello world!' })
  message!: string;
}
