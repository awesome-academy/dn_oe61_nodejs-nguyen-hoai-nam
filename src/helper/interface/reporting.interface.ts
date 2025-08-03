import { UserTaskStatus } from "src/database/dto/user_task.dto";

export class ReportResponseDto {
    totalTasks: number;
    completedTasks: number;
    averageProgress: number;
}

export class ActivityLogDto {
    taskName: string;
    subjectName: string;
    status: UserTaskStatus;
    assignedAt: Date | undefined;
    userName: string;
}

export interface MailJobData {
    to: string;
    subject: string;
    template: string;
    context: any;
}

