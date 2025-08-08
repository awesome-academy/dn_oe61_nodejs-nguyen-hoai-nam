import { ApiProperty } from "@nestjs/swagger";

export class registerToCourseSuccessResponseDto {
    @ApiProperty({ example: 200 })
    code: string;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Thành công" })
    message: string;

    @ApiProperty({
        example: {
            userCourseId: 34,
            userName: "trainee nè",
            courseName: "Khoá học Golang",
            registrationDate: "2025-08-06",
            courseProgress: 0,
            status: "RESIGN"
        }
    })
    data: {
        userCourseId: number,
        userName: string,
        courseName: string,
        registrationDate: string,
        courseProgress: number,
        status: string
    }
}

export class getCourseActiveSuccessResponseDto {
    @ApiProperty({ example: 200 })
    code: string;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Thành công" })
    message: string;

    @ApiProperty({
        example: {
            course_id: 3,
            name: "Khoá học Golang",
            description: "Khoá học gồm các bài hướng dẫn học Golang",
            start: "2025-08-09T17:00:00.000Z",
            end: "2025-09-09T17:00:00.000Z",
            status: "ACTIVE"
        }
    })
    data: {
        course_id: number,
        name: string,
        description: string,
        start: string,
        end: string,
        status: string
    }
}
