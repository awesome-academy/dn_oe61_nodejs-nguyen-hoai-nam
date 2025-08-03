import { ApiProperty } from '@nestjs/swagger';

export class MeSuccessResponseDto {
    @ApiProperty({example: 200})
    code: number;
    
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Thành công' })
    message: string;

    @ApiProperty({
        example: {
            id: 1,
            userName: "Supervisor",
            email: "yonex12360@gmail.com",
            role: "SUPERVISOR"
        },
    })
    data: {
        id: 1,
        userName: "Supervisor",
        email: "yonex12360@gmail.com",
        role: "SUPERVISOR"
    };
}
