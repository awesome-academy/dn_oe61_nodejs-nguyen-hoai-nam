import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { setI18nService } from './helper/decorators/i18n-validation.decorator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const i18n = app.get(I18nService) as I18nService<Record<string, unknown>>;
  setI18nService(i18n);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        throw new BadRequestException({
          code: 400,
          success: false,
          message: errors.map(err => ({
            field: err.property,
            message: Object.values(err.constraints || {}).join(', ')
          }))
        });
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
