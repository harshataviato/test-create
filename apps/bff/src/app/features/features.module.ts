import { Module } from '@nestjs/common';
import { HelloWorldModule } from './hello-world/HelloWorldModule';

@Module({
  imports: [
    HelloWorldModule,
  ],
  controllers: [],
  providers: [],
  exports: [
    HelloWorldModule,
  ],
})
export class FeaturesModule {}
