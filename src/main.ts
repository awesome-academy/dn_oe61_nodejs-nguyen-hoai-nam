import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { setI18nService } from './helper/decorators/i18n-validation.decorator';
import { Language } from './helper/decorators/language.decorator';
import { asyncLocalStorage } from './middleware/language.middleware';
import { LanguageRequest } from './helper/constants/lang.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
            const field = err.property;
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
            return { field, message: translatedMessages.join(', ') };
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
