export enum Role {
     TRAINEE = 'TRAINEE',
     SUPERVISOR = 'SUPERVISOR',
}

export enum UserStatus {
     ACTIVE = 'ACTIVE',
     INACTIVE = 'INACTIVE',
}

export class CreateUserDto {
     email: string;
     user_name: string;
     password: string;
     role: Role;
     status: UserStatus;
}

export class UpdateUserDto {
     email?: string;
     user_name?: string;
     password?: string;
     role?: Role;
     status?: UserStatus;
}
