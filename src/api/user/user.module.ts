import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { SupervisorModule } from './supervisor/supervisor.module';
import { TraineeModule } from './trainee/trainee.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SupervisorModule, TraineeModule],
  controllers: [UserController],
  providers: [UserService, I18nUtils]
})
export class UserModule {}
