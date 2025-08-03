import { ApiProperty } from "@nestjs/swagger";

export class EditProfileResponseDto {
    @ApiProperty({example: 200})
    code: number;
    
    @ApiProperty({ example: true })
    success: true;

    @ApiProperty({ example: 'Cập nhật thành công' })
    message: string;

    @ApiProperty({
        example: {
            userName: 'trainee',
            email: 'trainee123@gmail.com',
        }
    })
    data: {
        userName: string,
        email: string,
    }
}
