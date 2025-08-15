import { Module } from '@nestjs/common';
import { TraineeController } from './trainee.controller';
import { TraineeService } from './trainee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { hashPassword } from 'src/helper/shared/hash_password.shared';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { PaginationService } from 'src/helper/shared/pagination.shared';

@Module({
  imports: [TypeOrmModule.forFeature([User,UserSubject,UserCourse])],
  controllers: [TraineeController],
  providers: [TraineeService,I18nUtils,hashPassword, PaginationService]
})
export class TraineeModule {}
