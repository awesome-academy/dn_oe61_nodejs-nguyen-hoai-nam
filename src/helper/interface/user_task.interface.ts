export class TrainingCalendarDto {
  courseName: string;
  subjectName: string;
  taskName: string;
  startAt: string;
  endAt: string;
  type: 'subject' | 'task';
  status?: string;
}

export interface ViewTaskDto {
  name: string;
  fileUrl: string;
}

