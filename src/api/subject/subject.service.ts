import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/database/dto/user.dto';
import { CourseSubject } from 'src/database/entities/course_subject.entity';
import { Subject } from 'src/database/entities/subject.entity';
import { Task } from 'src/database/entities/task.entity';
import { User } from 'src/database/entities/user.entity';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { GetCourse } from 'src/helper/shared/get_course.shared';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { CreateSubjectDto, UpdateSubjectDto } from 'src/validation/class_validation/subject.validation';
import { CreateTaskDto } from 'src/validation/class_validation/task.validation';
import { DatabaseValidation } from 'src/validation/existence/existence.validator';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class SubjectService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
        @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
        @InjectRepository(CourseSubject) private readonly courseSubject: Repository<CourseSubject>,
        private readonly i18nUtils: I18nUtils,
        private readonly dataSource: DataSource,
        private readonly getCourse: GetCourse,
        private readonly mailerService: MailerService,
        private readonly logger: Logger,
        private readonly paginationService: PaginationService,
    ) { }

    async create(subjectInput: CreateSubjectDto, user: User, lang: string): Promise<{ subjects: Subject; tasks: Task[] }> {
        const existing = await this.subjectRepo.findOneBy({
            name: subjectInput.name,
            creator: { userId: user.userId },
        });

        if (existing) {
            throw new BadRequestException(this.i18nUtils.translate('validation.subject.subject_duplicate', {}, lang),);
        }

        const { tasks } = subjectInput;

        await this.checkUserRole(user.userId, user.role, lang);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const manager = queryRunner.manager;

        try {
            const savedSubject = await this.savedSubject(manager, subjectInput, user.userId)
            const savedTasks = await this.savedTasks(manager, tasks, savedSubject.subjectId);
            const data = {
                subjects: savedSubject,
                tasks: savedTasks
            }
            
            await queryRunner.commitTransaction();

            return data;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('startCourse failed', error?.stack || error);
            throw new InternalServerErrorException(this.i18nUtils.translate('validation.server.internal_server_error', {}, lang));

        } finally {
            await queryRunner.release();
        }
    }

    private async savedSubject(manager: EntityManager, subjectInput: CreateSubjectDto, userId: number): Promise<Subject> {
        const { name, description, studyDuration } = subjectInput;
        const subjectRepo = manager.getRepository(Subject);

        const subject = subjectRepo.create({
            name,
            description,
            studyDuration,
            creator: { userId: userId },
        });
        return await subjectRepo.save(subject);
    }

    private async savedTasks(manager: EntityManager, tasks: CreateTaskDto[], subjectId: number): Promise<Task[]> {
        const taskRepo = manager.getRepository(Task);

        const data = tasks.map((task) => {
            return taskRepo.create({
                "name": task.name,
                "fileUrl": task.fileUrl,
                "subject": { subjectId: subjectId }
            });
        });
        return await taskRepo.save(data);
    }

    private async checkUserRole(userId: number, userRole: Role, lang: string): Promise<void> {
        const user: User | null = await this.userRepo.findOneBy({ userId: userId, role: userRole });

        if (!user || user.role === Role.TRAINEE) {
            throw new BadRequestException(this.i18nUtils.translate('validation.subject.user_not_found', {}, lang));
        }
    }

    async update(subjectInput: UpdateSubjectDto, subjectId: number, lang: string): Promise<UpdateSubjectDto> {
        const hasValidField = Object.values(subjectInput).some(value => value !== undefined);

        if (!hasValidField) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.missing_required_fields', {}, lang));
        }

        const savedSubject = await this.findAndUpdateSubject(subjectId, subjectInput, lang);
        const data = {
            name: savedSubject.name,
            description: savedSubject.description,
            studyDuration: savedSubject.studyDuration,
        }
        return data;

    }

    private async findSubjectOrFail(subjectId: number, lang: string): Promise<Subject> {
        const subject = await this.subjectRepo.findOneBy({ subjectId: subjectId });
        if (!subject) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.no_changes', {}, lang));
        }
        return subject;
    }

    private async findAndUpdateSubject(subjectId: number, subjectInput: UpdateSubjectDto, lang: string): Promise<Subject> {
        const subject = await this.findSubjectOrFail(subjectId, lang);

        const { name, description, studyDuration } = subjectInput;

        if (name !== undefined) subject.name = name;
        if (description !== undefined) subject.description = description;
        if (studyDuration !== undefined) subject.studyDuration = studyDuration;

        const savedSubject: Subject | null = await this.subjectRepo.save(subject);

        if (!savedSubject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.crud.update_faild', {}, lang));
        }

        return savedSubject;
    }

    async delete(subjectId: number, lang: string): Promise<void> {
        return await this.dataSource.transaction(async (manager) => {
            await this.checkSubjectDeletable(manager, subjectId, lang);

            const deleteResult = await manager.delete(Subject, { subjectId });
            if (deleteResult.affected === 0) {
                throw new BadRequestException(
                    this.i18nUtils.translate('validation.crud.delete_failed', {}, lang)
                );
            }
        });
    }

    private async checkSubjectDeletable(manager: EntityManager, subjectId: number, lang: string): Promise<void> {
        const [subject, task, courseSubject] = await Promise.all([
            manager.findOne(Subject, { where: { subjectId } }),
            manager.findOne(Task, { where: { subject: { subjectId } } }),
            manager.findOne(CourseSubject, { where: { subject: { subjectId } } }),
        ]);

        if (!subject) {
            throw new BadRequestException(this.i18nUtils.translate('validation.subject.subject_not_found', {}, lang));
        }

        if (task) {
            throw new BadRequestException(this.i18nUtils.translate('validation.subject.subject_has_tasks', {}, lang));
        }

        if (courseSubject) {
            throw new BadRequestException(this.i18nUtils.translate('validation.subject.subject_has_courses', {}, lang));
        }
    }

    async getSubjectById(subjectId: number, lang: string): Promise<Subject> {
        const subject = await this.subjectRepo.findOne({
            where: { subjectId },
            relations: ['tasks', 'courseSubjects', 'courseSubjects.course']
        });

        if (!subject) {
            throw new NotFoundException(this.i18nUtils.translate('validation.subject.subject_not_found', {}, lang));
        }

        return subject
    }

    async getAll(page: number, pageSize: number, lang: string) {
        const [subjects, totalItems] = await this.subjectRepo.findAndCount({
            order: { createdAt: 'ASC' as const },
            take: pageSize,
            skip: (page - 1) * pageSize,
        });

        const totalPages = Math.ceil(totalItems / pageSize);

        return {
            items: subjects,
            meta: {
                totalItems,
                totalPages,
                currentPage: page,
            },
        };
    }
}
