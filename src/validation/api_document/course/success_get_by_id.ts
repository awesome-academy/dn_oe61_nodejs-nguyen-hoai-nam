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
            id: 1,
            name: "Khóa học Nodejs",
            description: "Khóa học gồm các bài hướng dẫn học Nodejs",
            status: "ACTIVE",
            start: "2025-06-01",
            end: "2025-08-05",
            creator: {
                "userId": 1,
                "userName": "Supervisor One"
            },
            subjects: [
                {
                    subjectId: 1,
                    name: "Toán học",
                    description: "Môn học về toán cơ bản",
                    studyDuration: 50,
                    createdAt: "2025-08-04T08:53:25.000Z",
                    updatedAt: "2025-08-08T04:39:15.106Z"
                },
                {
                    subjectId: 2,
                    name: "Vật lý",
                    description: "Môn học về vật lý cơ bản",
                    studyDuration: 50,
                    createdAt: "2025-08-04T08:53:25.000Z",
                    updatedAt: "2025-08-08T04:39:15.109Z"
                },
            ]
        }
    })
    data: {
        id: number;
        name: string;
        description: string;
        status: string;
        start: string;
        end: string;
        creator: {
            userId: number;
            userName: string;
        };
        subjects: Array<{
            subjectId: number;
            name: string;
            description: string;
            studyDuration: number;
            createdAt: string;
            updatedAt: string;
        }>;
    }
}
