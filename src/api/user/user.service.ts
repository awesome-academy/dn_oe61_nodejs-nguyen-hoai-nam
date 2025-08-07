import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Role } from 'src/database/dto/user.dto';
import { User } from 'src/database/entities/user.entity';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { MyProfile } from 'src/helper/interface/user.interface';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { UpdateUserDto } from 'src/validation/class_validation/user.validation';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly i18nUtils: I18nUtils,
        private readonly databaseValidation: DatabaseValidation
    ) { }

    async getProfileUser(userId: number, lang: string): Promise<ApiResponse | MyProfile> {

        if (!userId) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound'))
        }

        const user = await this.databaseValidation.checkIdExists(this.userRepo, userId);

        if (!user) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound'))
        }

        const data = {
            userId: user.userId,
            userName: user.userName,
            email: user.email,
            role: user.role,
            status: user.status
        }

        return data;
    }

    async editProfileUser(userData: UpdateUserDto, userId: number, lang: string): Promise<ApiResponse|UpdateUserDto> {
        
        if (!userId) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        const user = await this.databaseValidation.checkIdExists(this.userRepo, userId);

        if (!user) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        const userName = userData?.userName;
        const email = userData?.email;
        const updateUser = await this.userRepo.update({ userId: userId }, { userName, email });

        if (updateUser.affected === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.update_faild', {}, lang))
        }
        
        return {
            userName: userName,
            email: email
        };
    }

    async viewProfile(userId: number, userRole: string, lang: string): Promise<ApiResponse> {
        const getUser = await this.getUser(userId, userRole, lang);

        if (!getUser) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        const user = {
            userId: getUser.userId,
            userName: getUser.userName,
            email: getUser.email,
            role: getUser.role,
        } as User;

        return {
            success: true,
            data: user
        }

    }

    private async getUser(userId: number, userRole: string, lang: string) {
        try {

            const query = this.userRepo.createQueryBuilder('user')
                .where('user.userId = :userId', { userId });

            if (userRole === Role.SUPERVISOR) {
                query.andWhere('user.role = :role', { role: Role.TRAINEE });
            } else if (userRole !== Role.ADMIN) {
                query.andWhere('1 = 0');
            }

            const getUser: User | null = await query.getOne();
            return getUser;
        } catch (error) {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }
}
