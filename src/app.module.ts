import { Module } from '@nestjs/common';
import { ChatModule } from './modules';

@Module({
  imports: [ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
