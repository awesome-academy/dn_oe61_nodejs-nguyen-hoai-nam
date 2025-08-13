import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { setI18nService } from './helper/decorators/i18n-validation.decorator';
import { LanguageRequest } from './helper/constants/lang.constant';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('Training System')
    .setDescription('Tài liệu API cho hệ thống Training System')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api_docs', app, document);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('views', [
    path.join(__dirname, '..', 'src', 'templates', 'admin'),
    path.join(__dirname, '..', 'src', 'templates', 'admin','chat'),
    path.join(__dirname, '..', 'src', 'templates', 'admin','course'),
    path.join(__dirname, '..', 'src', 'templates', 'admin','trainee'),
    path.join(__dirname, '..', 'src', 'templates', 'admin','supervisor'),
    path.join(__dirname, '..', 'src', 'templates', 'admin','subject'),
    path.join(__dirname, '..', 'src', 'templates', 'admin','task'),
    path.join(__dirname, '..', 'src', 'templates', 'email')
  ]);
  app.useStaticAssets(join(__dirname,'..','public'));

  expressApp.set('view engine', 'pug');
  const i18n = app.get(I18nService) as I18nService<Record<string, unknown>>;
  setI18nService(i18n);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: async (errors) => {
        const lang = LanguageRequest();
        const messages = await Promise.all(
          errors.map(async (err) => {
            const rawMessages = Object.values(err.constraints || {});
            const translatedMessages = await Promise.all(
              rawMessages.map(async (msg) => {
                try {
                  return await i18n.translate(msg, { lang });
                } catch {
                  return msg;
                }
              }),
            );
            return translatedMessages.join(', ');
          }),
        );
        throw new BadRequestException({
          code: 400,
          success: false,
          message: messages,
        });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
