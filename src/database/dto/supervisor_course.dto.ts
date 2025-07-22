export class CreateSupervisorCourseDto {
  course_id: number;
  supervisor_id: number;
}

export class UpdateSupervisorCourseDto {
  course_id?: number;
  supervisor_id?: number;
} 
