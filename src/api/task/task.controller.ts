import { Body, Controller, Delete, Param, Post, Put, Get } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, TaskIdDto, UpdateTaskDto } from 'src/validation/class_validation/task.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { QueryParam } from 'src/helper/decorators/user.decorator';

@Controller('task')
export class TaskController {
    constructor(
        private readonly taskService: TaskService
    ) { }

    @Post('')
    async create(@Body() taskInput: CreateTaskDto, @Language() lang: string) {
        const result = await this.taskService.create(taskInput, lang);
        return result;
    }

    @Put(':taskId')
    async update(@Body() taskInput: UpdateTaskDto, @Param() taskId: TaskIdDto, @Language() lang: string) {
        const result = await this.taskService.update(taskInput, taskId.taskId, lang);
        return result;
    }

    @Delete(':taskId')
    async delete(@Param() taskId: TaskIdDto, @Language() lang: string) {
        const result = await this.taskService.delete(taskId.taskId, lang);
        return result;
    }

    @Get(':taskId')
    async getById(@Param() taskId: TaskIdDto, @Language() lang: string) {
        const result = await this.taskService.getById(taskId.taskId, lang);
        return result;
    }

    @Get('')
    async getAll(@QueryParam(['page', 'pageSize']) pagination: { page: number; pageSize: number }, @Language() lang: string) {
        const { page, pageSize } = pagination;
        const result = await this.taskService.getAll(page, pageSize, lang);
        return result
    }
}
