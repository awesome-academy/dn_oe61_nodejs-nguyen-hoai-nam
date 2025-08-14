import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import * as dotenv from 'dotenv';
import { BlacklistedToken } from 'src/database/entities/blacklisted_token.entity';
import { BlacklistService } from './black_list.service';
import { PassportModule } from '@nestjs/passport';
dotenv.config();

@Module({
    imports: [
        TypeOrmModule.forFeature([User,BlacklistedToken]),
        PassportModule.register({ session: false })
    ],
    controllers: [AuthController],
    providers: [AuthService, I18nUtils,BlacklistService],
    exports: [BlacklistService]
})
export class AuthModule { }
