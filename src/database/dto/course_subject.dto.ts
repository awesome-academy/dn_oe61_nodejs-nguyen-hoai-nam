export enum CourseSubjectStatus {
  START = 'START',
  FINISH = 'FINISH',
  NOT_STARTED = 'NOT STARTED',
}

export class SubjectDto {
  course_id: number;
  subject_id: number;
  status: CourseSubjectStatus;
}

export class UpdateCourseSubjectDto {
  status?: CourseSubjectStatus;
}
