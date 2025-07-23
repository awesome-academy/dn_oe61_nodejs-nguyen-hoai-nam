import { Module, Global, DynamicModule } from '@nestjs/common';
import { DatabaseValidation } from './existence/existence.validator';

@Global()
@Module({
    providers: [DatabaseValidation],
    exports: [DatabaseValidation]
})
export class ValidationModule {}
