import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { User } from 'src/database/entities/user.entity';
import { ApiResponse } from 'src/helper/interface/api.interface';
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

    async getProfileUser(userId: number, lang: string): Promise<ApiResponse> {

        if (!userId) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound'))
        }

        const user = await this.databaseValidation.checkIdExists(this.userRepo, userId);

        if (!user) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound'))
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.auth.user_success', {}, lang),
            data: {
                userId: user.userId,
                userName: user.userName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        }
    }

    async editProfileUser(userData: UpdateUserDto, req: Request, lang: string): Promise<ApiResponse> {
        const userId = (req.user as User).userId || undefined;

        if (!userId) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        const user = await this.databaseValidation.checkIdExists(this.userRepo, userId);

        if (!user) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        const userName = userData.userName;
        const email = userData.email;
        const updateUser = await this.userRepo.update({ userId: userId }, { userName, email });

        if (updateUser.affected === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.update_faild', {}, lang))
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.update_success'),
        }
    }
}
