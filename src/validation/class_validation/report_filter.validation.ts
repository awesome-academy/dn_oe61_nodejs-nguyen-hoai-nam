import { IsEnum, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'src/helper/decorators/i18n-validation.decorator';

export class ReportFilterDto {
  @IsEnum(['daily', 'monthly'], i18nValidationMessage('validation.report.type.isEnum'),)
  type: 'daily' | 'monthly';

  @IsDateString({},i18nValidationMessage('validation.report.startDate.isDate'))
  startDate: string;

  @IsDateString({}, i18nValidationMessage('validation.report.endDate.isDate'))
  endDate: string;

  @IsOptional()
  @IsNumber({},i18nValidationMessage('validation.report.courseId.isNumber'))
  courseId?: number;
}
