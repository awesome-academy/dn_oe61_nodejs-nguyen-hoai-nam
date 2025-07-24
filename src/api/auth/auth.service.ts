import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { AuthDto } from 'src/validation/auth_validation/auth.validation';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { payLoadDataType } from 'src/helper/interface/pay_load.interface';
import { CreateUserDto } from 'src/validation/class_validation/user.validation';
import { Role } from 'src/database/dto/user.dto';
import { AuthErrors } from 'src/helper/constants/error.constant';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly databaseValidation: DatabaseValidation,
        private readonly jwtToken: JwtService,
        private readonly i18nUtils: I18nUtils,
    ) { }


    async login(userInput: AuthDto, lang: string): Promise<ApiResponse> {
        const { email, password } = userInput;
    
        const user = await this.databaseValidation.checkEmailExists(this.userRepo, email);
        const isValidPassword = user && (await this.comparePassword(password, user.password));
    
        if (!isValidPassword) {
          throw new UnauthorizedException(
            this.i18nUtils.translate('validation.auth.invalid_credentials', {}, lang)
          );
        }
    
        const payload = {
          id: user.userId,
          userName: user.userName,
          email: user.email,
          role: user.role,
        };
    
        const accessToken = await this.generateToken(payload);
    
        if (!accessToken) {
          throw new UnauthorizedException(AuthErrors.LOGIN_FAILED);
        }
    
        return {
          success: true,
          message: this.i18nUtils.translate('validation.auth.login_success', {}, lang),
          data: {
            user: {
              id: user.userId,
              name: user.userName,
              role: user.role,
            },
            token: accessToken,
          },
        };
      }

    async register(userInput: CreateUserDto,lang:string): Promise<ApiResponse> {
        const {email,password,userName} = userInput;

        const existingUser = await this.databaseValidation.checkEmailExists(this.userRepo, userInput.email.trim());
        if (existingUser) {
            throw new BadRequestException(
                this.i18nUtils.translate('validation.auth.email_exists', {}, lang)
            );
        }

        const hashedPassword = await this.hashPassword(password, 10);
        if (!hashedPassword) {
            throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
        }

        const newUser = this.userRepo.create({
            email: email,
            userName: userName,
            password: hashedPassword,
            role: Role.TRAINEE,
        });

        const result = await this.userRepo.save(newUser);

        if (!result) {
            throw new UnauthorizedException(AuthErrors.REGISTER_FAILED);
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.auth.register_success', {}, lang),
            data: {
                id: newUser.userId,
                email: newUser.email,
                name: newUser.userName,
                role: newUser.role,
                status: newUser.status,
            }
        };
    }

    async comparePassword(passwordInput: string, userPassword: string) {
        const result = await bcrypt.compare(passwordInput, userPassword);
        return result;
    }

    async hashPassword(passwordInput: string, saltOrRounds: number) {
        const result = await bcrypt.hash(passwordInput, saltOrRounds);
        return result;
    }

    async generateToken(payload: payLoadDataType) {
        const accessToken = await this.jwtToken.signAsync(payload);
        return accessToken;
    }
}
