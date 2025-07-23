import { IsString, IsEmail, IsNotEmpty, MinLength} from 'class-validator';

export class AuthDto {
    @IsString({message:"Email không hợp lệ"})
    @IsEmail({},{ message: 'Email không hợp lệ' })
    @IsNotEmpty({message: "Email không được để trống"})
    email: string;

    @IsString({message:"Password không hợp lệ"})
    @IsNotEmpty({message: "Password không được để trống"})
    @MinLength(6,{message: "Mật khẩu phải lớn hơn 6 ký tự"})
    password: string;
}
