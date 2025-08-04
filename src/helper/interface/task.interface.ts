import { UserTask } from "src/database/entities/user_task.entity";

export interface SubjectDto {
    subjectId: number;
    name: string;
    description: string;
  }
  
  export interface TaskWithSubjectDto {
    taskId: number;
    name: string;
    fileUrl: string;
    createdAt: Date;
    updatedAt: Date;
    userTasks: UserTask[];
    subject: SubjectDto;
  }
  