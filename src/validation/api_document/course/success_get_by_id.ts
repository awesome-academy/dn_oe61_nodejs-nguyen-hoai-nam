import { ApiProperty } from "@nestjs/swagger";

export class GetByIdCourseSuccessResponseDto {
    @ApiProperty({ example: 200 })
    code: number;

    @ApiProperty({ example: true })
    success: true;

    @ApiProperty({ example: 'Thành công' })
    message: string;

    @ApiProperty({
        example: {
            name: "Khóa học Nodejs",
            description: "Khóa học gồm các bài hướng dẫn học Nodejs",
            status: "ACTIVE",
            start: "2025-06-01",
            end: "2025-08-05"
        }
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
