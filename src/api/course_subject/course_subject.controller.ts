import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CourseSubjectService } from './course_subject.service';
import { courseIdDto } from 'src/validation/class_validation/course.validation';
import { Language } from 'src/helper/decorators/language.decorator';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';
import { subjectIdDto, SubjectIdsDto } from 'src/validation/class_validation/subject.validation';
import { ApiResponse } from 'src/helper/interface/api.interface';
import { CreateCourseWithSubjectsDto, DeleteCourseSubjectResult, GetByIdCourseWithSubjectsDto } from 'src/helper/interface/course_subject.interface';
import { I18nUtils } from 'src/helper/utils/i18n-utils';

@Controller('course_subject')
export class CourseSubjectController {
    constructor(
        private readonly courseSubjectService: CourseSubjectService,
        private readonly i18nUtils: I18nUtils,
    ) { }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Get(':courseId')
    async getById(@Param() courseId: courseIdDto, @Language() lang: string): Promise<ApiResponse | CreateCourseWithSubjectsDto> {
        const result = await this.courseSubjectService.getById(courseId.courseId, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Post(':courseId')
    async create(@Param() courseId: courseIdDto, @Body() subjectId: SubjectIdsDto, @Language() lang: string): Promise<ApiResponse | GetByIdCourseWithSubjectsDto> {
        const result = await this.courseSubjectService.create(courseId.courseId, subjectId.subjectIds, lang);
        return result;
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Delete(':courseId/subjects')
    async delete(@Param() courseId: courseIdDto, @Body() subjectId: SubjectIdsDto, @Language() lang: string): Promise<ApiResponse | DeleteCourseSubjectResult> {
        const result = await this.courseSubjectService.delete(courseId.courseId, subjectId.subjectIds, lang);
        return {
            success: true,
            message: this.i18nUtils.translate('validation.crud.delete_success'),
            data: result
        };
    }
}
