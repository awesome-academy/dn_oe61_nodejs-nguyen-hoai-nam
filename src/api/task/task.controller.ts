import { Body, Controller, Delete, Param, Post, Put, Get } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, TaskIdDto, UpdateTaskDto } from 'src/validation/class_validation/task.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { QueryParam } from 'src/helper/decorators/user.decorator';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { TaskWithSubjectDto } from 'src/helper/interface/task.interface';
import { Task } from 'src/database/entities/task.entity';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('task')
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
        private readonly i18nUtils: I18nUtils,
    ) { }

    @Post('')
    async create(@Body() taskInput: CreateTaskDto, @Language() lang: string): Promise<ApiResponse | TaskWithSubjectDto> {
        const result = await this.taskService.create(taskInput, lang);
        return result;
    }

    @Put(':taskId')
    async update(@Body() taskInput: UpdateTaskDto, @Param() taskId: TaskIdDto, @Language() lang: string): Promise<ApiResponse | Task> {
        const result = await this.taskService.update(taskInput, taskId.taskId, lang);
        return result;
    }

    @Delete(':taskId')
    async delete(@Param() taskId: TaskIdDto, @Language() lang: string): Promise<ApiResponse | void> {
        await this.taskService.delete(taskId.taskId, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.delete_success', {}, lang)
        };
    }

    @Get(':taskId')
    async getById(@Param() taskId: TaskIdDto, @Language() lang: string): Promise<ApiResponse | Task> {
        const result = await this.taskService.getById(taskId.taskId, lang);
        return result;
    }

    @Get('')
    async getAll(@QueryParam(['page', 'pageSize']) pagination: { page: number; pageSize: number }, @Language() lang: string): Promise<ApiResponse> {
        const { page, pageSize } = pagination;
        const { data, meta } = await this.taskService.getAll(page, pageSize, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.response_api.success', {}, lang),
            data: {
                items: data,
                meta: meta,
            },
        };
    }
}
