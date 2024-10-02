import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as fs from 'fs';
import { join } from 'path';
import * as http from 'http';
import * as https from 'https';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const httpsOptions = {
    key: fs.readFileSync(join(__dirname, './https/www.yozica.top.key')),
    cert: fs.readFileSync(join(__dirname, './https/www.yozica.top.pem')),
  };

  await app.init();

  // http
  //   .createServer((req, res) => {
  //     res.writeHead(301, { Location: 'https://www.yozica.top/' });
  //     res.end();
  //   })
  //   .listen(80);
  http.createServer(server).listen(3000);
  https.createServer(httpsOptions, server).listen(443);
}
bootstrap();
