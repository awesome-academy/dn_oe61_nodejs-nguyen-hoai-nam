import { Module, Global, DynamicModule } from '@nestjs/common';
import { DatabaseValidation } from './existence/existence.validator';
import { I18nUtils } from 'src/helper/utils/i18n-utils';

@Global()
@Module({
    providers: [DatabaseValidation,I18nUtils],
    exports: [DatabaseValidation]
})
export class ValidationModule {}
