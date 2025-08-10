export interface SubjectItem {
    subjectId: number;
    name: string;
    description: string;
    studyDuration: number;
    status: string;
}

export interface CourseItem {
    courseId: number;
    name: string;
    description: string;
    status: string;
    start: string | Date;
    end: string | Date;
}

export interface CreateCourseWithSubjectsDto {
    course: CourseItem;
    subjects: SubjectItem[];
}

export interface CourseDto {
    courseId: number;
    name: string;
    description: string;
    status: string;
    start: Date | string;
    end: Date | string;
}

export interface SubjectDto {
    subjectId: number;
    name: string;
    description: string;
    studyDuration: number;
}

export interface GetByIdCourseWithSubjectsDto {
    course: CourseDto;
    subjects: SubjectDto[];
}

export interface DeleteCourseSubjectResult {
    deleted: number[];
    totalDeleted: number;
}

