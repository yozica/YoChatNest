import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(join(__dirname, './https/www.yozica.top.key')),
    cert: fs.readFileSync(join(__dirname, './https/www.yozica.top.pem')),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

  await app.listen(8080);
}
bootstrap();
