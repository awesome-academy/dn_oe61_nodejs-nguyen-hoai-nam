import { ApiProperty } from "@nestjs/swagger";

export class GetAllCourseSuccessResponseDto {
    @ApiProperty({example: 200})
    code: number;

    @ApiProperty({ example: true })
    success: true;

    @ApiProperty({ example: 'Thành công' })
    message: string;

    @ApiProperty({
        example: [
            {
                id: 1,
                name: "Khóa học Nodejs",
                description: "Khóa học gồm các bài hướng dẫn học Nodejs",
                status: "ACTIVE",
                start: "2025-06-01",
                end: "2025-08-05"
            },
            {
                id: 3,
                name: "Khoá học Golang",
                description: "Khoá học gồm các bài hướng dẫn học Golang",
                status: "DISABLE",
                start: "2025-08-10",
                end: "2025-09-10"
            }
        ]
    })
    data: {
        id: number,
        name: string,
        description: string,
        status: string,
        start: string,
        end: string
    }
}
