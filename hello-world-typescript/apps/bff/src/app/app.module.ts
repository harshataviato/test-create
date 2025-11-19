import { Module } from '@nestjs/common';
import { FeaturesModule } from './features/FeaturesModule';
import { FoundationModule } from './foundation/FoundationModule';

@Module({
  imports: [
    FoundationModule,
    FeaturesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
