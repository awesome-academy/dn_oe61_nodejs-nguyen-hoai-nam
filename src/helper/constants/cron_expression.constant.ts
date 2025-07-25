export const CronExpression = {
    EVERY_5_SECONDS: '*/5 * * * * *',
    HOURLY: '0 0 * * * *',    // mỗi giờ, phút 0 giây 0
    DAILY: '0 0 0 * * *',     // mỗi ngày lúc 00:00:00
    WEEKLY: '0 0 0 * * 0',    // mỗi tuần, Chủ Nhật lúc 00:00:00
    MONTHLY: '0 0 0 1 * *',   // mỗi tháng, ngày 1 lúc 00:00:00
};
