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
            name: "Vật lý",
            description: "Môn học về vật lý cơ bản",
            studyDuration: 48,
            tasks: [
                {
                    name: "Bài tập Lý 1",
                    fileUrl: "https://example.com/task3.pdf"
                },
                {
                    name: "Bài tập Lý 2",
                    fileUrl: "https://example.com/task4.pdf"
                }
            ]
        }
    })
    data: {
        name: string,
        description: string,
        studyDuration: number,
        tasks: [
            {
                name: string,
                fileUrl: string
            },
        ]
    }
}
