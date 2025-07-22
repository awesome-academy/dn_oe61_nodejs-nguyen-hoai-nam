export enum UserTaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class CreateUserTaskDto {
  user_subject_id: number;
  task_id: number;
  status: UserTaskStatus;
}

export class UpdateUserTaskDto {
  status?: UserTaskStatus;
} 
