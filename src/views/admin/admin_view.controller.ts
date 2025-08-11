import { Controller, Get, Render, Param } from '@nestjs/common';
import { Language } from '../../helper/decorators/language.decorator';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('admin')
export class AdminViewController {
    @Get('dashboard')
    @Render('dashboard')
    dashboardPage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('profile')
    @Render('user/profile')
    getProfilePage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('users')
    @Render('user/users')
    getUsersPage() {
        return { layout: 'layouts/admin-layout' };
    }

    @Get('user/:id')
    @Render('user/user-detail')
    getUserDetailPage() { }

    @Get('report')
    @Render('report')
    getReportPage() { 
        return { layout: 'layouts/admin-layout' };
    }

    @Get('users/:id')
    @Render('user/profile')
    getUserDetailPageById(@Param('id') id: number) {
        return { layout: 'layouts/admin-layout', userId: id };
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

    @Get('courses/:courseId/trainee/:traineeId/progress')
    @Render('trainee/trainee-progress')
    getTraineeProgressPage(@Param('courseId') courseId: number, @Param('traineeId') traineeId: number) {
        return { layout: 'layouts/admin-layout', courseId: courseId, traineeId: traineeId };
    }

    @Get('trainees/:traineeId/subjects/:userSubjectId/progress')
    @Render('trainee/trainee-subject-progress')
    getTraineeSubjectProgressPage(@Param('traineeId') traineeId: number, @Param('userSubjectId') userSubjectId: number) {
        return { layout: 'layouts/admin-layout', traineeId: traineeId, userSubjectId: userSubjectId };
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
