import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeaturesModule } from './features/features.module';
import { FoundationModule } from './foundation/foundation.module';

@Module({
  imports: [
    FoundationModule,
    FeaturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
