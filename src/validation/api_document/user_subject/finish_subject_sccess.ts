import { ApiProperty } from "@nestjs/swagger";

export class FinishSubjectSuccessDto {
    @ApiProperty({ example: 200 })
    code: number;

    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: "Kết thúc chủ đề thành công" })
    message: string;
}
