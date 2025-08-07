import { ApiProperty } from "@nestjs/swagger";

export class MyProfileSuccessResponseDto {
    @ApiProperty({example: 200})
    code: number;
    
    @ApiProperty({ example: true })
    success: true;

    @ApiProperty({ example: 'Lấy thông tin người dùng thành công' })
    message: string;

    @ApiProperty({
        example: {
            userId: 4,
            userName: 'trainee',
            email: 'trainee123@gmail.com',
            role: 'TRAINEE',
            status: 'ACTIVE'
        }
    })
    data: {
        userId: number,
        userName: string,
        email: string,
        role: string,
        status: string
    }
}
