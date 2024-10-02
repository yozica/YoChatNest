import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

// 静态服务器配置
export const escrowServeStaticModule = ServeStaticModule.forRoot({
  rootPath: join(__dirname, '../wwwroot'),
});
