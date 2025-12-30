import { Module } from './framework/nest-like';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';
import { MemorialsController } from './memorials.controller';
import { DedicationsController } from './dedications.controller';

@Module({
  controllers: [AppController, MemorialsController, DedicationsController],
  providers: [AppService],
  imports: [PaymentsModule],
})
export class AppModule {}
