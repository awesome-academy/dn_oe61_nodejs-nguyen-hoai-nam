import { BadRequestException, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';

export const missingRequiredFieldsError = new BadRequestException('Missing required fields');
export const userNotFoundError = new NotFoundException('User not found');
export const updateFailedError = new InternalServerErrorException('Update failed');
export const emailExistsError = new ConflictException('Email already exists');
export const deleteNotAllowedError = new BadRequestException('Delete not allowed');
export const deleteFailedError = new InternalServerErrorException('Delete failed');
export const createFailedError = new InternalServerErrorException('Create failed');
export const noTraineeError = new NotFoundException('No trainee found');
export const traineeNotFoundError = new NotFoundException('Trainee not found');
export const noTraineeIdError = new BadRequestException('No trainee id found');
export const noTraineeEmailError = new BadRequestException('No trainee email found');
export const databaseConnectionLostError = new InternalServerErrorException('Database connection lost');
export const noTraineesError = new NotFoundException('No trainees');
