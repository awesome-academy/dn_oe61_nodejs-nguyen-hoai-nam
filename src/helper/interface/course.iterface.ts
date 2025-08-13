import { CourseStatus } from "src/database/dto/course.dto";
import { Subject } from "src/database/entities/subject.entity";
import { SupervisorCourse } from "src/database/entities/supervisor_course.entity";

export interface CourseListItem {
    id: number;
    name: string;
    description: string;
    status: CourseStatus;
    start: string;
    end: string;
}

export interface CourseDetailDto {
    id: number;
    courseId: number;
    name: string;
    description: string;
    status: CourseStatus;
    start: string;
    end: string;
    creator: { userId: number, userName: string } | null;
    subjects: Subject[];
}

export interface AssignTraineeToCourseResponseDto {
    userCourseId: number;
    userName: string;
    courseName: string;
    registrationDate: string;
    courseProgress: number;
    status: string;
}


