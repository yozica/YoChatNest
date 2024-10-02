import { Module } from '@nestjs/common';
import { escrowServeStaticModule } from './escrow-modules';
import { ChatModule } from './modules';

@Module({
  imports: [escrowServeStaticModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
