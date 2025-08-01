import { CourseStatus } from "src/database/dto/course.dto";

export interface CourseListItem {
    id: number;
    name: string;
    description: string;
    status: CourseStatus;
    start: string;
    end: string;
}

export interface CourseDetailDto {
    name: string;
    description: string;
    status: CourseStatus;
    start: string;
    end: string;
}

export interface AssignTraineeToCourseResponseDto {
    userCourseId: number;
    userName: string;
    courseName: string;
    registrationDate: string;
    courseProgress: number;
    status: string;
}


