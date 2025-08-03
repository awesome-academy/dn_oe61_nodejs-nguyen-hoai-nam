import { UserSubjectStatus } from "src/database/dto/user_subject.dto";
import { UserTaskStatus } from "src/database/dto/user_task.dto";

export class SubjectWithTasksDto {
  name: string;
  description: string;
  studyDuration: number;
  tasks: {
    name: string;
    fileUrl: string;
  }[];
}

export class ActivityHistoryDto {
  userSubjectId: number;
  courseName: string;
  subjectName: string;
  subjectStatus: UserSubjectStatus;
  startedAt: Date;
  finishedAt: Date;
  tasks: {
    taskId: number;
    taskName: string;
    status: UserTaskStatus;
  }[];
}

export interface TraineeCourseProgressDto {
  courseName: string | null;
  totalTasks: number;
  completedTasks: number;
  courseProgress: number;
  subjects: SubjectProgressDto[];
}

export class SubjectProgressDto {
  subjectName: string;
  status: UserSubjectStatus;
  startedAt: Date;
  finishedAt: Date;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export class TraineeInCourseDto {
  userId: number;
  name: string;
  email: string;
}
