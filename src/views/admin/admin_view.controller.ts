import { Controller, Get, Render, Param } from '@nestjs/common';
import { Language } from '../../helper/decorators/language.decorator';

@Controller('admin')
export class AdminViewController {
    @Get('dashboard')
    @Render('dashboard')
    dashboardPage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('users')
    @Render('users')
    usersPage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('trainees')
    @Render('trainee/trainees')
    traineesPage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('trainees/:id')
    @Render('trainee/trainee-detail')
    getTraineeDetailPage(@Param('id') id: number) {
        return { layout: 'layouts/admin-layout', traineeId: id };
    }

    @Get('tasks')
    @Render('task/tasks')
    getTasksPage(@Language() lang: string) {
        return {
            layout: 'admin/layout',
            lang: lang
        };
    }

    @Get('tasks/:taskId')
    @Render('task/task-detail')
    getTaskDetailPage(@Param('taskId') taskId: number, @Language() lang: string) {
        return {
            layout: 'layouts/admin-layout',
            lang: lang,
            taskId: taskId
        };
    }

    @Get('supervisors')
    @Render('supervisor/supervisors')
    supervisorsPage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('supervisors/:id')
    @Render('supervisor/supervisor-detail')
    getSupervisorDetailPage(@Param('id') id: number) {
        return { layout: 'layouts/admin-layout', supervisorId: id };
    }

    @Get('courses')
    @Render('course/courses')
    coursesPage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('courses/:id')
    @Render('course/course-detail')
    getCourseDetailPage(@Param('id') id: number) {
        return { layout: 'layouts/admin-layout', courseId: id };
    }

    @Get('subjects')
    @Render('subject/subjects')
    subjectsPage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('subjects/:id')
    @Render('subject/subject-detail')
    getSubjectDetailPage(@Param('id') id: number) {
        return { layout: 'layouts/admin-layout', subjectId: id };
    }

    @Get('tasks')
    @Render('task/tasks')
    tasksPage() {
        return { layout: 'layouts/admin-layout' };
    }
}
