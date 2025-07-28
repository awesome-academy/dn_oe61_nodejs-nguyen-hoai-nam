interface hasEmail {
    email: string;
}

interface hasId {
    userId: number;
}

interface HasCreatorCourse {
    courseId: number
}

interface HasCreatorSubject {
    subjectId: number
}

interface HasSupervisorCourse {
    supervisor: {
        userId: number;
    };
}
