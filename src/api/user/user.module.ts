import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { SupervisorModule } from './supervisor/supervisor.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SupervisorModule],
  controllers: [UserController],
  providers: [UserService, I18nUtils]
})
export class UserModule {}
