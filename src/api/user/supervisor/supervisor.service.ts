import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { CreateUserDto, UpdateUserDto } from 'src/validation/class_validation/user.validation';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { Role, UserStatus } from 'src/database/dto/user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { payLoadDataType } from 'src/helper/interface/pay_load.interface';
import { AuthService } from 'src/api/auth/auth.service';
import { link_change_password, link_confirm_account } from 'src/helper/constants/link.constant';
import { ChangePasswordDto } from 'src/validation/auth_validation/auth.validation';
import { templatePug } from 'src/helper/constants/template.constant';
import { BlacklistService } from 'src/api/auth/black_list.service';
import { Course } from 'src/database/entities/course.entity';
import { Subject } from 'src/database/entities/subject.entity';
import { SupervisorCourse } from 'src/database/entities/supervisor_course.entity';
import { courseEntities, subjectEntities, supervisorCourseEntities, tableName } from 'src/helper/constants/emtities.constant';

@Injectable()
export class SupervisorService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
        @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
        @InjectRepository(SupervisorCourse) private readonly supervisorCourse: Repository<SupervisorCourse>,
        private readonly i18nUtils: I18nUtils,
        private readonly databaseValidation: DatabaseValidation,
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
        private readonly blacklistService: BlacklistService
    ) { }

    async create(supervisorInput: CreateUserDto, lang: string): Promise<ApiResponse> {

        const isEmail = await this.databaseValidation.checkEmailExists(this.userRepo, supervisorInput.email);
        if (isEmail) {
            throw new BadRequestException(this.i18nUtils.translate('validation.auth.email_exists', {}, lang))
        }

        const savedSupervisor = await this.createAndSaveSupervisor(supervisorInput, lang);
        await this.prepareAndSendConfirmationEmail(savedSupervisor, lang);

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.create_success', {}, lang),
            data: {
                supervisor: {
                    userId: savedSupervisor.userId,
                    userName: savedSupervisor.userName,
                    email: savedSupervisor.email,
                    role: Role.SUPERVISOR,
                    status: savedSupervisor.status
                }
            }

        }
    }

    private async createAndSaveSupervisor(supervisorInput: CreateUserDto, lang: string): Promise<User> {
        const { userName, email, password } = supervisorInput;

        const saltRounds = this.getSaltRounds();
        const hashPassword = await this.authService.hashPassword(password, saltRounds);

        const supervisor = this.userRepo.create({
            userName: userName,
            email: email,
            password: hashPassword,
            role: Role.SUPERVISOR,
            status: UserStatus.INACTIVE
        });

        const result = await this.userRepo.save(supervisor);
        if (!result) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.create_faild', {}, lang));
        }

        return result;
    }

    private async prepareAndSendConfirmationEmail(user: User, lang: string) {
        try {
            const link = `${this.configService.get<string>('APP_URL')}/${link_confirm_account}`;
            const confirmationUrl = await this.confirmationUrl(link, user, lang);

            const email = user.email;
            const userName = user.userName;
            const template = templatePug.account_confirmation;
            const subject = this.i18nUtils.translate('validation.auth.verify_account', {}, lang);
            const context = {
                email: email,
                userName: userName,
                confirmationUrl: confirmationUrl
            };

            await this.sendEmail(email, subject, template, context, lang);
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    async confirmAccount(token: string, lang: string): Promise<ApiResponse> {
        let payLoad: payLoadDataType;
        try {
            payLoad = await this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException(this.i18nUtils.translate('validation.auth.token_invalid', {}, lang));
        }

        const user: User | null = await this.userRepo.findOne({ where: { userId: payLoad.userId } });
        if (!user) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException(this.i18nUtils.translate('validation.auth.already_verified', {}, lang))
        }

        await this.sendAccountVerifiedEmailAndBlacklist(user, token, lang);

        return {
            success: true,
            message: this.i18nUtils.translate('validation.auth.account_verified_success', {}, lang)
        };
    }

    private async sendAccountVerifiedEmailAndBlacklist(user: User, token: string, lang: string) {
        try {
            const link = `${this.configService.get<string>('APP_URL')}/${link_change_password}`;
            const linkUpdatePass = await this.confirmationUrl(link, user, lang);

            const email = user.email;
            const userName = user.userName;
            const template = templatePug.welcome;
            const subject = this.i18nUtils.translate('validation.auth.account_verified_success', {}, lang);
            const context = {
                email: email,
                userName: userName,
                linkUpdatePass: linkUpdatePass,
            };

            await this.sendEmail(email, subject, template, context, lang);
            await this.addToBlacklist(token, lang);
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    async changePassword(bodyInput: ChangePasswordDto, lang: string): Promise<ApiResponse> {
        const { password, token } = bodyInput;

        const user = await this.verifyTokenAndGetUser(token, lang);

        const saltRounds = this.getSaltRounds();
        const hashPassword = await this.authService.hashPassword(password, saltRounds);

        user.status = UserStatus.ACTIVE;
        user.password = hashPassword;
        const saveUser = await this.userRepo.save(user);
        if (!saveUser) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.no_changes', {}, lang));
        }

        await this.addToBlacklist(token, lang);

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.change_password_success', {}, lang)
        };
    }

    private async verifyTokenAndGetUser(token: string, lang: string): Promise<User> {
        let payLoad: payLoadDataType;
        try {
            payLoad = await this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException(this.i18nUtils.translate('validation.auth.token_invalid', {}, lang));
        }

        const user = await this.userRepo.findOne({ where: { userId: payLoad.userId } });
        if (!user) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang));
        }

        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException(this.i18nUtils.translate('validation.auth.already_verified', {}, lang));
        }

        return user;
    }

    private getSaltRounds(): number {
        const saltRoundsRaw = this.configService.get<string>('AUTH_SALT_ROUNDS');
        const saltRounds = saltRoundsRaw ? parseInt(saltRoundsRaw, 10) : 10;
        if (isNaN(saltRounds) || saltRounds <= 0) {
            return 10;
        }
        return saltRounds;
    }

    private async addToBlacklist(token: string, lang: string) {
        try {
            await this.blacklistService.addToBlacklist(token, lang);
        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    private async sendEmail(email: string, subject: string, template: string, context: any, lang: string) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: subject,
                template: template,
                context: context,
            });

        } catch {
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));
        }
    }

    private async confirmationUrl(link: string, result: User, lang: string) {
        const payLoad = { userId: result.userId, email: result.email };
        const token = await this.jwtService.signAsync(payLoad, { expiresIn: '1d' });
        const confirmationUrl = `${link}?lang=${lang}&token=${token}`;
        return confirmationUrl;
    }

    async getAll(lang: string): Promise<ApiResponse> {
        const supervisors: User[] = await this.userRepo.findBy({ role: Role.SUPERVISOR });

        if (supervisors.length === 0) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang))
        }

        const data = supervisors.map(users => {
            return {
                userId: users.userId,
                userName: users.userName,
                email: users.email,
                role: users.role,
                status: users.status
            }
        });

        return {
            success: true,
            message: this.i18nUtils.translate('validation.response_api.success', {}, lang),
            data: data
        }
    }

    async delete(userId: number, lang: string): Promise<ApiResponse> {
        const supervisor: User | null = await this.userRepo.findOneBy({ userId });

        if (!supervisor || supervisor.role !== Role.SUPERVISOR) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.delete_not_allowed', {}, lang));
        }

        await this.databaseValidation.checkUserRelationExists(this.courseRepo, tableName.course, courseEntities.creator, userId, lang);
        await this.databaseValidation.checkUserRelationExists(this.subjectRepo, tableName.subject, subjectEntities.creator, userId, lang);
        await this.databaseValidation.checkUserRelationExists(this.supervisorCourse, tableName.supervisorCourse, supervisorCourseEntities.supervisor, userId, lang);

        const deleteResult = await this.userRepo.delete(userId);
        if (deleteResult.affected === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.delete_faild', {}, lang));
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.delete_success', {}, lang),
        }
    }

    async update(supervisorId: number, supervisorInput: UpdateUserDto, lang: string): Promise<ApiResponse> {

        if (Object.keys(supervisorInput).length === 0) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.missing_required_fields', {}, lang));
        }

        if (!supervisorId) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang));
        }

        const savedSupervisor = await this.findAndUpdateSupervisor(supervisorId, supervisorInput, lang);

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.update_success', {}, lang),
            data: savedSupervisor
        };
    }

    private async findAndUpdateSupervisor(supervisorId: number, supervisorInput: UpdateUserDto, lang: string) {
        const supervisor = await this.findSupervisorOrFail(supervisorId, lang);

        const { userName, email, password, status } = supervisorInput;

        if (userName !== undefined) supervisor.userName = userName;
        if (email !== undefined) supervisor.email = email;
        if (password !== undefined) {
            const saltRounds = this.getSaltRounds();
            supervisor.password = await this.authService.hashPassword(password, saltRounds);
        }
        if (status !== undefined) supervisor.status = status;

        const savedSupervisor: User | null = await this.userRepo.save(supervisor);

        if (!savedSupervisor) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.update_faild', {}, lang));
        }

        return {
            userId: savedSupervisor.userId,
            userName: savedSupervisor.userName,
            email: savedSupervisor.email,
            status: savedSupervisor.status,
            role: savedSupervisor.role,
        };
    }

    async getById(supervisorId: number, lang: string): Promise<ApiResponse> {
        const supervisor = await this.userRepo.findOneBy({ userId: supervisorId, role: Role.SUPERVISOR });

        if (!supervisor) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang));
        }

        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.get_detail_success', {}, lang),
            data: {
                userId: supervisor.userId,
                userName: supervisor.userName,
                email: supervisor.email,
                status: supervisor.status,
                role: supervisor.role,
            },
        };
    }

    private async findSupervisorOrFail(userId: number, lang: string): Promise<User> {
        const supervisor = await this.userRepo.findOneBy({ userId: userId, role: Role.SUPERVISOR });
        if (!supervisor) {
            throw new NotFoundException(this.i18nUtils.translate('validation.auth.user_notfound', {}, lang));
        }
        return supervisor;
    }
}
