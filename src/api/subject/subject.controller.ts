import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto, subjectIdDto, UpdateSubjectDto } from 'src/validation/class_validation/subject.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { QueryParam, UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';
@Controller('subject')
export class SubjectController {
    constructor(
        private readonly subjectService: SubjectService,
    ) { }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Post('')
    async create(@Body() dataInput: CreateSubjectDto, @UserDecorator() user: User, @Language() lang: string) {
        const result = await this.subjectService.create(dataInput, user, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Put(':subjectId')
    async update(@Body() subjectInput: UpdateSubjectDto, @Param() subjectId: subjectIdDto, @Language() lang: string) {
        const result = await this.subjectService.update(subjectInput, subjectId.subjectId, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Delete(':subjectId')
    async delete(@Param() subjectId: subjectIdDto, @Language() lang: string) {
        const result = await this.subjectService.delete(subjectId.subjectId, lang);
        return result;
    }
    
    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Get(':subjectId')
    async getSubjectById(@Param() subjectId: subjectIdDto, @Language() lang: string) {
        const result = await this.subjectService.getSubjectById(subjectId.subjectId, lang);
        return result;
    }

    @Get('')
    async getAll(@QueryParam(['page', 'pageSize']) pagination: { page: number; pageSize: number }, @Language() lang: string) {
        const { page, pageSize } = pagination;
        const result = await this.subjectService.getAll(page, pageSize, lang);
        return result
    }
}
