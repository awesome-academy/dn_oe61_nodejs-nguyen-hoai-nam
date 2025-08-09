import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto, subjectIdDto, UpdateSubjectDto } from 'src/validation/class_validation/subject.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { QueryParam, UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';
import { Task } from 'src/database/entities/task.entity';
import { Subject } from 'src/database/entities/subject.entity';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('subject')
export class SubjectController {
    constructor(
        private readonly subjectService: SubjectService,
        private readonly i18nUtils: I18nUtils,
    ) { }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Post('')
    async create(@Body() dataInput: CreateSubjectDto, @UserDecorator() user: User, @Language() lang: string): Promise<ApiResponse | { subjects: Subject; tasks: Task[] }> {
        const result = await this.subjectService.create(dataInput, user, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Put(':subjectId')
    async update(@Body() subjectInput: UpdateSubjectDto, @Param() subjectId: subjectIdDto, @Language() lang: string): Promise<ApiResponse | UpdateSubjectDto> {
        const result = await this.subjectService.update(subjectInput, subjectId.subjectId, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Delete(':subjectId')
    async delete(@Param() subjectId: subjectIdDto, @Language() lang: string): Promise<ApiResponse | void> {
        await this.subjectService.delete(subjectId.subjectId, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.delete_success', {}, lang)
        };
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Get(':subjectId')
    async getSubjectById(@Param() subjectId: subjectIdDto, @Language() lang: string): Promise<ApiResponse | Subject> {
        const result = await this.subjectService.getSubjectById(subjectId.subjectId, lang);
        return result;
    }

    @Get('')
    async getAll(@QueryParam(['page', 'pageSize']) pagination: { page: number; pageSize: number }, @Language() lang: string): Promise<ApiResponse> {
        const { page, pageSize } = pagination;
        const data = await this.subjectService.getAll(page, pageSize, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.response_api.success', {}, lang),
            data
        }
    }
}
