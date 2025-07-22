export enum UserCourseStatus {
  FAIL = 'FAIL',
  PASS = 'PASS',
  RESIGN = 'RESIGN',
}

export class CreateUserCourseDto {
  course_id: number;
  user_id: number;
  registration_date: string;
  course_progress: number;
  status: UserCourseStatus;
}

export class UpdateUserCourseDto {
  registration_date?: string;
  course_progress?: number;
  status?: UserCourseStatus;
}
