export const DefaultLength = 255;
export const tableName = {
    course: 'course',
    subject: 'subject',
    supervisorCourse: 'supervisor_course',
    supervisor: 'supervisor',
    user_subject: 'user_subject',
    user_course: 'user_course'
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



