import { ApiProperty } from "@nestjs/swagger";

export class SearchCourseSuccessResponseDto {
    @ApiProperty({ example: 200 })
    code: string;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Thành công" })
    message: string;

    @ApiProperty({
        example: [
            {
                courseId: 1,
                name: "Khóa học Nodejs",
                description: "Khóa học gồm các bài hướng dẫn học Nodejs",
                status: "ACTIVE",
                start: "2025-06-01",
                end: "2025-08-05",
            },
            {
                courseId: 2,
                name: "Khóa học PHP",
                description: "Khóa học gồm các bài hướng dẫn học PHP",
                status: "ACTIVE",
                start: "2025-06-15",
                end: "2025-08-06",
            },
        ]
    })
    data: {
        courseId: number,
        name: string,
        description: string,
        status: string,
        start: string,
        end: string,
    }
}
