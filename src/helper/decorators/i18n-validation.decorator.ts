import {
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { I18nService } from 'nestjs-i18n';

let i18nService: I18nService;

export function setI18nService(service: I18nService) {
  i18nService = service;
}

function getI18nMessage(key: string, args: any[] = []): string {
  if (!i18nService) {
    return `I18nService not available. Key: ${key}`;
  }
  return i18nService.translate(key, { args });
}

export function i18nValidationMessage(
  key: string,
  validationOptions?: ValidationOptions,
): ValidationOptions {
  return {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      const argsArray = Object.values(args.constraints || []);
      return getI18nMessage(key, argsArray);
    },
  };
} 