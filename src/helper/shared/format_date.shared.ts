import { format, toZonedTime } from 'date-fns-tz';

export function formatDate(date: Date, timeZone: string): string {
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'dd-MM-yyyy HH:mm:ss', { timeZone });
}

export function formatDateForMySQL(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
}

export const address = 'Asia/Ho_Chi_Minh';
