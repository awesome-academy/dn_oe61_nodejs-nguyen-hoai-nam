import { ApiProperty } from "@nestjs/swagger";

export class GetTrainingCalendarSuccessDto {
    @ApiProperty({ example: 200 })
    code: number;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Thành công" })
    message: string;

    @ApiProperty({
        example: [
            {
                courseName: "Khóa học Nodejs",
                subjectName: "Toán học",
                taskName: "Bài tập Toán 1",
                startAt: "2025-08-01T01:00:00.000Z",
                endAt: "2025-08-16T01:00:00.000Z",
                type: "task"
            },
            {
                courseName: "Khóa học Nodejs",
                subjectName: "Toán học",
                taskName: "Bài tập Toán 2",
                startAt: "2025-08-16T01:00:00.000Z",
                endAt: "2025-08-31T01:00:00.000Z",
                type: "task"
            }
        ]
    })
    data: {
        courseName: "Khóa học Nodejs",
        subjectName: "Toán học",
        taskName: "Bài tập Toán 2",
        startAt: "2025-08-16T01:00:00.000Z",
        endAt: "2025-08-31T01:00:00.000Z",
        type: "task"
    }
}

export class CompleteTaskSuccessDto {
    @ApiProperty({ example: 200 })
    code: number;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Báo cáo nhiệm vụ thành công" })
    message: string;
}

export class ViewTaskSuccessDto {
    @ApiProperty({ example: 200 })
    code: number;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Thành công" })
    message: string;

    @ApiProperty({
        example: [
            {
                t_name: "Bài tập Toán 1",
                file_url: "https://example.com/task1.pdf"
            }
        ]
    })
    data: {
        t_name: "Bài tập Toán 1",
        file_url: "https://example.com/task1.pdf"
    }
}
