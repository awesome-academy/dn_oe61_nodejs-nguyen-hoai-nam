export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  DISABLE = 'DISABLE',
}

export class CreateCourseDto {
  name: string;
  description: string;
  status: CourseStatus;
  start: string;
  end: string;
  creator_id: number;
}

export class UpdateCourseDto {
  name?: string;
  description?: string;
  status?: CourseStatus;
  start?: string;
  end?: string;
} 
