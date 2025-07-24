import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsInt,
} from 'class-validator';
import { UserTaskStatus } from '../../database/dto/user_task.dto'

export class UserTaskDto {
    @IsInt({ message: 'user_subject_id phải là số nguyên' })
    @IsNotEmpty({ message: 'user_subject_id không được để trống' })
    userSubjectId?: number;

    @IsInt({ message: 'task_id phải là số nguyên' })
    @IsNotEmpty({ message: 'task_id không được để trống' })
    taskId?: number;

    @IsEnum(UserTaskStatus, { message: 'Status không hợp lệ' })
    @IsNotEmpty({ message: 'Status không được để trống' })
    status: UserTaskStatus;
}
