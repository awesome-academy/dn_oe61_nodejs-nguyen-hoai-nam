import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { i18nValidationMessage } from './i18n-validation.decorator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: i18nValidationMessage(
        'validation.password.isStrongPassword',
        validationOptions
      ),
      validator: {
        validate(value: any) {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return typeof value === 'string' && regex.test(value);
        },
      },
    });
  };
} 
