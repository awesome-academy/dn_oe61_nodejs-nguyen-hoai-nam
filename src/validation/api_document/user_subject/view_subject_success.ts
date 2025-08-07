import { ApiProperty } from "@nestjs/swagger";

export class ViewSubjectSuccessDto {
    @ApiProperty({ example: 200 })
    code: number;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Thành công" })
    message: string;

    @ApiProperty({
        example: {
            subjectId: 1,
            name: "Vật lý",
            description: "Môn học về vật lý cơ bản",
            studyDuration: 48,
            subjectProgress: 100,
            tasks: [
                {
                    taskId: 1,
                    name: "Bài tập Lý 1",
                    fileUrl: "https://example.com/task3.pdf"
                },
                {
                    taskId: 2,
                    name: "Bài tập Lý 2",
                    fileUrl: "https://example.com/task4.pdf"
                }
            ]
        }
    })
    data: {
        subjectId: number,
        name: string,
        description: string,
        studyDuration: number,
        subjectProgress: number,
        tasks: [
            {
                taskId: number,
                name: string,
                fileUrl: string
            },
        ]
    }
}
