export const DefaultLength = 255;
export const tableName = {
    course: 'course',
    subject: 'subject',
    supervisorCourse: 'supervisor_course',
    supervisor: 'supervisor',
    userSubject: 'user_subject',
    userCourse: 'user_course',
    courseSubject: 'course_subject'
}

export const courseEntities = {
    courseId: 'courseId',
    name: 'name',
    description: 'description',
    status: 'status',
    start: 'start',
    end: 'end',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    creator: 'creator',
    courseSubjects: 'courseSubjects',
    supervisorCourses: 'supervisorCourses',
    userCourses: 'userCourses'

};

export const subjectEntities = {
    subjectId: 'subjectId',
    name: 'name',
    description: 'description',
    studyDuration: 'studyDuration',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    creator: 'creator',
    tasks: 'tasks',
    courseSubjects: 'courseSubjects'
};

export const supervisorCourseEntities = {
    supervisorCourseId: 'supervisorCourseId',
    course: 'course',
    supervisor: 'supervisor'
};

export const userSubject = {
    ID: 'userSubjectId',
    USER: 'user',
    COURSE_SUBJECT: 'courseSubject',
    PROGRESS: 'subjectProgress',
    STATUS: 'status',
};

export const userCourse = {
    ID: 'userCourseId',
    COURSE: 'course',
    USER: 'user',
    REGISTRATION_DATE: 'registrationDate',
    COURSE_PROGRESS: 'courseProgress',
    STATUS: 'status',
};

export const courseConstants = {
    ID: 'courseId',
    NAME: 'name',
    DESCRIPTION: 'description',
    STATUS: 'status',
    START: 'start',
    END: 'end',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    CREATOR: 'creator',
    COURSE_SUBJECTS: 'courseSubjects',
    SUPERVISOR_COURSES: 'supervisorCourses',
    USER_COURSES: 'userCourses',
} as const;

export const userCourseConstants = {
    ID: 'userCourseId',
    COURSE: 'course',
    USER: 'user',
    REGISTRATION_DATE: 'registrationDate',
    PROGRESS: 'courseProgress',
    STATUS: 'status',
} as const;
