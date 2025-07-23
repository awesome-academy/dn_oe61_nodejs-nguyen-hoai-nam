export class CreateSubjectDto {
  name: string;
  description: string;
  study_duration: number;
  creator_id: number;
}

export class UpdateSubjectDto {
  name?: string;
  description?: string;
  study_duration?: number;
} 
