export const CronExpression = {
    EVERY_5_SECONDS: '*/5 * * * * *',
    HOURLY: '0 0 * * * *',    // mỗi giờ, phút 0 giây 0
    DAILY: '0 0 0 * * *',     // mỗi ngày lúc 00:00:00
    WEEKLY: '0 0 0 * * 0',    // mỗi tuần, Chủ Nhật lúc 00:00:00
    MONTHLY: '0 0 0 1 * *',   // mỗi tháng, ngày 1 lúc 00:00:00
    DAILY_AT_23_59: '0 59 23 * * *', // mỗi ngày lúc 23:59:00
    RUN: '* * * * *',
};

export const todayDate = new Date().toLocaleDateString('en-CA');
export const firstCourseProgress = 0;
export const firstUserSubjectProgress = 0;
export const course_process_constant = 50;
export const maxProgress = 100;
export const endDateOfCourse = 2;
export const millisecondsPerDay = 24 * 60 * 60 * 1000;
export const formatDateConstant = 'dd/MM/yyyy';
export const subjectDailySummary = '[Báo cáo tổng hợp] Hoạt động học viên trong ngày';
export const subjectCourseReminder = `[Nhắc nhở] Khóa học sắp kết thúc`;
export const maxSizeFile = 400 * 1024 * 1024;
