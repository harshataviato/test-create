import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeaturesModule } from './features/FeaturesModule';
import { FoundationModule } from './foundation/FoundationModule';

@Module({
  imports: [
    FoundationModule,
    FeaturesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
