import { Module } from '@nestjs/common';
import { HelloWorldController } from './HelloWorldController';
import { HelloWorldFeatureFlag } from './HelloWorldFeatureFlag';
import { FoundationModule } from '../../foundation/foundation.module';
import { NRMAProviders } from './nrma/NRMAProviders';

@Module({
  imports: [FoundationModule],
  controllers: [HelloWorldController],
  providers: [
    HelloWorldFeatureFlag,
    ...NRMAProviders,
  ],
  exports: [],
})
export class HelloWorldModule {}
