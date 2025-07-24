import { ValidationOptions, ValidationArguments } from 'class-validator';
import { I18nService } from 'nestjs-i18n';

let i18nService: I18nService;

export function setI18nService(service: I18nService) {
  i18nService = service;
}

function getI18nMessageSync(key: string, args: Record<string, any> = {}): string {
  if (!i18nService) {
    return `I18nService not available. Key: ${key}`;
  }

  const translation = (i18nService as any).translateSync
    ? (i18nService as any).translateSync(key, { args })
    : key;

  return translation;
}

export function i18nValidationMessage(
  key: string,
  validationOptions?: ValidationOptions,
): ValidationOptions {
  return {
    ...validationOptions,
    message: (args: ValidationArguments) => {
      const constraints = args.constraints?.[0] || {};
      return getI18nMessageSync(key, constraints);
    },
  };
}
