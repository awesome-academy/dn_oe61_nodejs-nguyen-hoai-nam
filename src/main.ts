import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { setI18nService } from './helper/decorators/i18n-validation.decorator';
import { Language } from './helper/decorators/language.decorator';
import { asyncLocalStorage } from './middleware/language.middleware';
import { LanguageRequest } from './helper/constants/lang.constant';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  expressApp.set('views', path.join(__dirname, '..', 'src', 'templates', 'email'));
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
