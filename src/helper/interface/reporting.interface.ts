import { UserTaskStatus } from "src/database/dto/user_task.dto";

export class ReportResponseDto {
    totalSubjects: number;
    completedSubjects: number;
    uncompletedSubjects: number;
    averageSubjectProgress: number;

    totalTasks: number;
    completedTasks: number;
    uncompletedTasks: number;
    averageTaskCompletionRate: number;
}

export interface ActivityLogDto {
    courseId: number;
    userId: number;
    eventType: ActivityEventType;
    timestamp: string;
    meta?: {
        subjectId?: number;
        taskId?: number;
        courseId?: number;
    };
}

export interface ActivityEventType {
    COURSE_REGISTER : 'COURSE_REGISTER',
    COURSE_FINISH : 'COURSE_FINISH',
    SUBJECT_START : 'SUBJECT_START',
    SUBJECT_FINISH : 'SUBJECT_FINISH',
    TASK_DONE : 'TASK_DONE',
}

export interface MailJobData {
    to: string;
    subject: string;
    template: string;
    context: any;
}

