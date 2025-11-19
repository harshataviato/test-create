import { Module } from '@nestjs/common';
import { HelloWorldModule } from '../endpoints/hello-world/HelloWorldModule';

@Module({
  imports: [
    HelloWorldModule,
  ],
  exports: [
    HelloWorldModule,
  ],
})
export class FeaturesModule {}
