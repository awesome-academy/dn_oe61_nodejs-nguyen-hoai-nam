import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { UserDecorator } from 'src/helper/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { Language } from 'src/helper/decorators/language.decorator';
import { AuthRoles } from 'src/helper/decorators/auth_roles.decorator';
import { Role } from 'src/database/dto/user.dto';
import { ReportingService } from './reporting.service';
import { ReportFilterDto } from 'src/validation/class_validation/report_filter.validation';
import { ActivityLogDto, ReportResponseDto } from 'src/helper/interface/reporting.interface';

@Controller('reporting')
export class ReportingController {
    constructor(
        private readonly reportingService: ReportingService,
    ) { }

    @AuthRoles(Role.SUPERVISOR, Role.ADMIN)
    @Get('')
    async getReport(@Query() filter: ReportFilterDto, @UserDecorator() user: User, @Language() lang: string): Promise<ReportResponseDto> {
        return this.reportingService.getReportData(filter, user, lang);
    }

    @AuthRoles(Role.ADMIN, Role.SUPERVISOR)
    @Get(':courseId/logs')
    async getActivityLogs(@Param('courseId', ParseIntPipe) courseId: number,@Language() lang: string, @Query('userId') userId: number, @UserDecorator() user: User): Promise<ActivityLogDto[]> {
        return this.reportingService.getActivityLogs(courseId,lang, user, userId);
    }
}
