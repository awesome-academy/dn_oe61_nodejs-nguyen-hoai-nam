import { ApiProperty } from "@nestjs/swagger";

export class GetActivityHistorySuccessDto {
    @ApiProperty({ example: 200 })
    code: number;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Kết thúc chủ đề thành công" })
    message: string;

    @ApiProperty({
        example: [
            {
                userSubjectId: 1,
                courseName: "Khóa học Nodejs",
                subjectName: "Toán học",
                subjectStatus: "COMPLETED",
                startedAt: "2025-08-01T01:00:00.000Z",
                finishedAt: "2025-08-07T13:52:11.000Z",
                tasks: [
                    {
                        taskId: 1,
                        taskName: "Bài tập Toán 1",
                        status: "DONE"
                    },
                    {
                        taskId: 2,
                        taskName: "Bài tập Toán 2",
                        status: "DONE"
                    }
                ]
            },
            {
                userSubjectId: 2,
                courseName: "Khóa học Nodejs",
                subjectName: "Vật lý",
                subjectStatus: "COMPLETED",
                startedAt: "2025-08-07T05:01:34.000Z",
                finishedAt: "2025-08-07T13:41:56.000Z",
                tasks: [
                    {
                        "taskId": 4,
                        "taskName": "Bài tập Lý 2",
                        "status": "DONE"
                    }
                ]
            }
        ]
    })
    data: [
        userSubjectId: number,
        courseName: string,
        subjectName: string,
        subjectStatus: string,
        startedAt: string,
        finishedAt: string,
        tasks: [
            {
                taskId: number,
                taskName: string,
                status: string
            },
        ]
    ]
}
