import { Role, UserStatus } from "src/database/dto/user.dto";
import { User } from "src/database/entities/user.entity";

export class UpdateUserInterface {
    userName?: string;
    email?: string;
    password?: string;
    status?: number;
}

export class MyProfile {
    userId: number;
    userName: string;
    email: string;
    role: Role;
    status: UserStatus;
}
