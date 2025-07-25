import { Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { SupervisorService } from './supervisor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { AuthService } from 'src/api/auth/auth.service';
import { BlacklistedToken } from 'src/database/entities/blacklisted_token.entity';
import { BlacklistService } from 'src/api/auth/black_list.service';

@Module({
  imports: [TypeOrmModule.forFeature([User,BlacklistedToken])],
  controllers: [SupervisorController],
  providers: [SupervisorService,I18nUtils,AuthService,BlacklistService]
})
export class SupervisorModule {}  
