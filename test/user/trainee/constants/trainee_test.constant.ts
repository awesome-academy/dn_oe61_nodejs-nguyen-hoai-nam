import { UpdateUserDto, userIdDto } from "src/validation/class_validation/user.validation";

export const traineeId: userIdDto = { userId: 1 };
export const updateDto: UpdateUserDto = { userName: 'updateduser' };
export const updateDtoEmail: UpdateUserDto = { email: 'test@example.com' };
