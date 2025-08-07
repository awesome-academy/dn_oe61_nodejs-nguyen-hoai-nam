import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { CreateUserDto, UpdateUserDto } from 'src/validation/class_validation/user.validation';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { hashPassword } from 'src/helper/shared/hash_password.shared';
import { Role, UserStatus } from 'src/database/dto/user.dto';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { UserCourse } from 'src/database/entities/user_course.entity';
import { UserSubject } from 'src/database/entities/user_subject.entity';
import { tableName, userCourse, userSubject } from 'src/helper/constants/emtities.constant';
import { KeyObject } from 'crypto';

@Injectable()
export class TraineeService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(UserCourse) private readonly userCourseRepo: Repository<UserCourse>,
        @InjectRepository(UserSubject) private readonly userSubjectRepo: Repository<UserSubject>,
        private readonly databaseValidation: DatabaseValidation,
        private readonly i18nUtils: I18nUtils,
        private readonly hashPassword: hashPassword
    ) { }

    async getAll(lang: string): Promise<ApiResponse> {
        const trainee: User[] | null = await this.userRepo.findBy({ role: Role.TRAINEE });

        if (trainee.length === 0) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        const datas = trainee.map(trainee => {
            return {
                userId: trainee.userId,
                userName: trainee.userName,
                email: trainee.email,
                role: trainee.role,
                status: trainee.status
            }
        });

        return {
            success: true,
            message: this.i18nUtils.translate('validation.response_api.success', {}, lang),
            data: datas
        }
    }

    async getById(traineeId: number, lang: string): Promise<ApiResponse> {
        const trainee = await this.userRepo.findOneBy({ userId: traineeId, role: Role.TRAINEE });

        if (!trainee) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.get_detail_success', {}, lang),
            data: {
                userId: trainee.userId,
                userName: trainee.userName,
                email: trainee.email,
                status: trainee.status,
                role: trainee.role,
            },
        }
    }

    async create(traineeInput: CreateUserDto, lang: string): Promise<ApiResponse> {
        const isEmail = await this.databaseValidation.checkEmailExists(this.userRepo, traineeInput.email);

        if (isEmail) {
            throw new BadRequestException(this.i18nUtils.translate('validation.auth.email_exists', {}, lang))
        }

        const { userName, email, password } = traineeInput;

        const hashPassword = await this.hashPassword.hashPassword(password);

        const data = this.userRepo.create({
            userName: userName,
            email: email,
            password: hashPassword,
            role: Role.TRAINEE,
            status: UserStatus.ACTIVE
        } as User);

        const result = await this.userRepo.save(data);

        if (!result) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.create_faild', {}, lang))
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.create_success', {}, lang),
            data: result
        }
    }

    async delete(traineeId: number, lang: string): Promise<ApiResponse> {
        const trainee: User | null = await this.userRepo.findOneBy({ userId: traineeId, role: Role.TRAINEE })

        if (!trainee) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.delete_not_allowed', {}, lang))
        }

        await this.databaseValidation.checkUserRelationExists(this.userSubjectRepo, tableName.userSubject, userSubject.USER, traineeId, lang);
        await this.databaseValidation.checkUserRelationExists(this.userCourseRepo, tableName.userCourse, userCourse.USER, traineeId, lang);

        const deleteTrainee = await this.userRepo.delete(traineeId);

        if (deleteTrainee.affected === 0) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.delete_faild', {}, lang))
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.delete_success'),
        }
    }

    async update(traineeId: number, traineeInput: UpdateUserDto, lang: string) {

        if (Object.keys(traineeInput).length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.missing_required_fields', {}, lang));
        }

        if (!traineeId) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang));
        }

        const savedTrainee = await this.findAndUpdateTrainee(traineeId, traineeInput, lang);

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.update_success', {}, lang),
            data: {
                userId: savedTrainee.userId,
                userName: savedTrainee.userName,
                email: savedTrainee.email,
                status: savedTrainee.status,
                role: savedTrainee.role,
            }
        };
    }

    private async findTraineeOrFail(traineeId: number, lang: string): Promise<User> {
        const trainee = await this.userRepo.findOneBy({ userId: traineeId, role: Role.TRAINEE });
        if (!trainee) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.no_changes', {}, lang));
        }
        return trainee;
    }

    private async findAndUpdateTrainee(supervisorId: number, supervisorInput: UpdateUserDto, lang: string) {
        const trainee = await this.findTraineeOrFail(supervisorId, lang);

        const { userName, email, password, status, role } = supervisorInput;

        if (userName !== undefined) trainee.userName = userName;
        if (email !== undefined) trainee.email = email;
        if (password !== undefined) {
            const hashPassword = await this.hashPassword.hashPassword(password);
            trainee.password = hashPassword
        }
        if (status !== undefined) trainee.status = status;
        if (role !== undefined) trainee.role = role;

        const savedTrainee: User | null = await this.userRepo.save(trainee);

        if (!savedTrainee) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.update_faild', {}, lang));
        }

        return savedTrainee;
    }
}
