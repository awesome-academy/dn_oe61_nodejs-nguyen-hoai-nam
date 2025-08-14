import { ApiProperty } from "@nestjs/swagger";

export class ListMySubjectSuccessDto {
    @ApiProperty({ example: 200 })
    code: number;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Thành công" })
    message: string;

    @ApiProperty({
        example: [
            {
                userSubjectId: 1,
                subjectId: 1,
                subjectName: "Toán học",
                courseName: "Khóa học Nodejs",
                status: "IN_PROGRESS",
                subjectProgress: 33
            },
            {
                userSubjectId: 2,
                subjectId: 2,
                subjectName: "Vật lý",
                courseName: "Khóa học Nodejs",
                status: "NOT_STARTED",
                subjectProgress: 0
            },
        ]
    })
    data: [
        {
            userSubjectId: number,
            subjectId: number,
            subjectName: string,
            courseName: string,
            status: string,
            subjectProgress: number
        },
    ]
}
