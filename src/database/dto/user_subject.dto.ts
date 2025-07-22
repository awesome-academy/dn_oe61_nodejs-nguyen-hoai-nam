export enum UserSubjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class CreateUserSubjectDto {
  user_id: number;
  course_subject_id: number;
  subject_progress: number;
  status: UserSubjectStatus;
}

export class UpdateUserSubjectDto {
  subject_progress?: number;
  status?: UserSubjectStatus;
} 
