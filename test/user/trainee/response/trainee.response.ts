import { Role, UserStatus } from "src/database/dto/user.dto";

export const traineeResponse = {
    success: true,
    message: '',
    data: {
        userId: Number,
        userName: String,
        email: String,
        role: Role.TRAINEE,
        status: UserStatus.ACTIVE,
    },
}

export const traineeCreateResponse = {
    success: true,
    message: '',
    data: {
        userId: 1,
        email: 'test@example.com',
        userName: 'testuser',
        password: 'Password123!',
        role: Role.TRAINEE,
        status: UserStatus.ACTIVE,
    }
};

export const traineeUpdateResponse = {
    success: true,
    message: '',
    data: {
        userId: 1,
        userName: 'updateduser',
        email: 'test@example.com',
        role: Role.TRAINEE,
        status: UserStatus.ACTIVE,
    }
};

export const traineeDeleteResponse = { success: true, message: '' };

