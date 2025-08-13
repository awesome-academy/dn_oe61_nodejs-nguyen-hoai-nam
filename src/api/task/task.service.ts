import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'src/database/entities/subject.entity';
import { Task } from 'src/database/entities/task.entity';
import { UserTask } from 'src/database/entities/user_task.entity';
import { TaskWithSubjectDto } from 'src/helper/interface/task.interface';
import { PaginationService } from 'src/helper/shared/pagination.shared';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { CreateTaskDto, UpdateTaskDto } from 'src/validation/class_validation/task.validation';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
        @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
        @InjectRepository(UserTask) private readonly userTaskRepo: Repository<UserTask>,
        private readonly i18nUtils: I18nUtils,
        private readonly dataSource: DataSource,
        private readonly paginationService: PaginationService,
    ) { }

    async create(taskInput: CreateTaskDto, lang: string): Promise<TaskWithSubjectDto> {
        const subject: Subject | null = await this.subjectRepo.findOneBy({ subjectId: taskInput.subjectId });

        if (!subject) {
            throw new BadRequestException(this.i18nUtils.translate('validation.subject.subject_not_found', {}, lang));
        }

        const savedTask = await this.dataSource.transaction(async (manager) => {
            const taskRepo = manager.getRepository(Task);
            const task = taskRepo.create({
                name: taskInput.name,
                fileUrl: taskInput.fileUrl,
                subject: { subjectId: subject.subjectId }
            });

            return await taskRepo.save(task);
        });

        const data = {
            ...savedTask,
            subject: {
                subjectId: subject.subjectId,
                name: subject.name,
                description: subject.description,
            }
        }

        return data;
    }

    async update(taskInput: UpdateTaskDto, taskId: number, lang: string): Promise<Task> {
        const task: Task | null = await this.taskRepo.findOneBy({ taskId: taskId });

        if (!task) {
            throw new BadRequestException(this.i18nUtils.translate('validation.task.task_not_found', {}, lang))
        }

        const savedTask = await this.savedTask(taskInput, taskId, lang, task);

        return savedTask;
    }

    private async savedTask(taskInput: UpdateTaskDto, taskId: number, lang: string, task: Task): Promise<Task> {
        const { name, fileUrl, subjectId } = taskInput;

        if (subjectId !== undefined) {
            const subject = await this.subjectRepo.findOneBy({ subjectId });
            if (!subject) {
                throw new BadRequestException(this.i18nUtils.translate('validation.subject.subject_not_found', {}, lang));
            }

            task.subject = subject;
        }

        if (name !== undefined) task.name = name;
        if (fileUrl !== undefined) task.fileUrl = fileUrl;

        const savedTask: Task | null = await this.taskRepo.save(task);

        if (!savedTask) {
            throw new BadRequestException(this.i18nUtils.translate('validation.crud.update_faild', {}, lang));
        }

        return savedTask;
    }

    async delete(taskId: number, lang: string): Promise<void> {
        return await this.dataSource.transaction(async (manager) => {
            const taskRepo = manager.getRepository(Task);
            const userTaskRepo = manager.getRepository(UserTask);

            const task = await taskRepo.findOneBy({ taskId });
            if (!task) {
                throw new BadRequestException(this.i18nUtils.translate('validation.task.task_not_found', {}, lang));
            }

            const isTaskUsed = await userTaskRepo.exists({
                where: { task: { taskId } },
            });

            if (isTaskUsed) {
                throw new BadRequestException(this.i18nUtils.translate('validation.task.task_in_use', {}, lang));
            }

            await taskRepo.remove(task);
        });
    }

    async getById(taskId: number, lang: string): Promise<Task> {
        const task = await this.taskRepo.findOne({
            where: { taskId },
            relations: ['subject'],
        });

        if (!task) {
            throw new BadRequestException(this.i18nUtils.translate('validation.task.task_not_found', {}, lang));
        }

        return task;
    }

    async getAll(page: number, pageSize: number, lang: string) {
        const result = await this.paginationService.queryWithPagination(
            this.taskRepo,
            { page, pageSize },
            { order: { createdAt: 'ASC' }, relations: ['subject'] }
        );

        return result;
    }
}
