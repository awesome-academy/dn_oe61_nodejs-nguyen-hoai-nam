import { TraineeController } from '../../../src/api/user/trainee/trainee.controller';
import { TraineeService } from '../../../src/api/user/trainee/trainee.service';
import { userIdDto } from '../../../src/validation/class_validation/user.validation';
import { NotFoundException } from '@nestjs/common';
import * as F from './dto/trainee.fixture';
import { traineeId, updateDto, updateDtoEmail } from './constants/trainee_test.constant';
import { emailExistsError, createFailedError, missingRequiredFieldsError, userNotFoundError, updateFailedError, deleteNotAllowedError, deleteFailedError, databaseConnectionLostError } from './constants/error.constant';
import { traineeCreateResponse, traineeUpdateResponse, traineeDeleteResponse, traineeResponse } from './response/trainee.response';
import { buildTestingModule, expectPagination } from './dto/test_helpers';

describe('TraineeController [DI]', () => {
    let traineeController: TraineeController;
    let mockTraineeService: jest.Mocked<TraineeService>;

    beforeEach(async () => {
        const built = await buildTestingModule({
            controller: TraineeController,
            service: TraineeService,
            serviceMethods: ['getAll', 'getById', 'create', 'update', 'delete'],
        });
        traineeController = built.controller;
        mockTraineeService = built.serviceMock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return an array of trainees', async () => {

            const expectedResult = F.SUCCESS_GET_ALL;
            mockTraineeService.getAll.mockResolvedValue(expectedResult);

            const result = await traineeController.getAll(F.LANG, F.PAGINATION);
            expect(result).toEqual(expectedResult);
            expect(result.data.items).toEqual(expectedResult.data.items);
            expect(Array.isArray(result.data.items)).toBe(true);
            expect(result.data.items[0]).toMatchObject(expectedResult.data.items[0]);
            expectPagination(result, F.META);
            expect(mockTraineeService.getAll).toHaveBeenCalledWith(F.LANG, 1, 10);
        });

        it('should throw an error if service fails', async () => {
            const error = new NotFoundException('No trainees found');
            mockTraineeService.getAll.mockRejectedValue(error);
            await expect(traineeController.getAll(F.LANG, F.PAGINATION)).rejects.toThrow(error);
        });

        it('should propagate unexpected errors', async () => {
            const err = databaseConnectionLostError;
            mockTraineeService.getAll.mockRejectedValue(err);
            await expect(traineeController.getAll(F.LANG, F.PAGINATION)).rejects.toThrow(err);
        });

        it('should throw BadRequestException for invalid pagination', async () => {
            mockTraineeService.getAll.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.getAll(F.LANG, F.INVALID_PAGINATION)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.getAll(F.LANG, F.INVALID_PAGINATION2)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            mockTraineeService.getAll.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.getAll(null as unknown as string, F.PAGINATION)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.getAll('jp' as unknown as string, F.PAGINATION)).rejects.toThrow(missingRequiredFieldsError);
        });
    });

    describe('getById', () => {
        it('should return a single trainee', async () => {
            const expectedResult = F.EXPECTED_RESULT;
            mockTraineeService.getById.mockResolvedValue(expectedResult);
            const result = await traineeController.getById(traineeId, F.LANG);
            expect(result).toEqual(expectedResult);
            expect(result).toMatchObject(traineeResponse);
            expect(mockTraineeService.getById).toHaveBeenCalledWith(traineeId.userId, F.LANG);
        });

        it('should throw NotFoundException if trainee not found', async () => {

            const traineeId: userIdDto = { userId: 999 };
            const error = new NotFoundException('Trainee not found');
            mockTraineeService.getById.mockRejectedValue(error);
            await expect(traineeController.getById(traineeId, F.LANG)).rejects.toThrow(error);
        });

        it('should propagate unexpected errors', async () => {
            const err = databaseConnectionLostError;
            mockTraineeService.getById.mockRejectedValue(err);
            await expect(traineeController.getById(traineeId, F.LANG)).rejects.toThrow(err);
        });

        it('should throw BadRequestException for invalid language', async () => {
            mockTraineeService.getById.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.getById(traineeId, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.getById(traineeId, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw error for invalid userId', async () => {
            const invalidId = { userId: 'invalid' } as unknown as userIdDto;
            mockTraineeService.getById.mockRejectedValue(userNotFoundError);
            await expect(traineeController.getById(invalidId, F.LANG)).rejects.toThrow(userNotFoundError);
        });
    });

    describe('create', () => {
        it('should create a new trainee', async () => {

            mockTraineeService.create.mockResolvedValue(traineeCreateResponse);
            const result = await traineeController.create(traineeCreateResponse.data, F.LANG);
            expect(result).toEqual(traineeCreateResponse);
            expect(mockTraineeService.create).toHaveBeenCalledWith(traineeCreateResponse.data, F.LANG);

            expect(result.data).toMatchObject(traineeCreateResponse.data);
            expect(result.success).toEqual(traineeCreateResponse.success);
        });

        it('should throw BadRequestException if email exists', async () => {
            mockTraineeService.create.mockRejectedValue(emailExistsError);
            await expect(traineeController.create(traineeCreateResponse.data, F.LANG)).rejects.toThrow(emailExistsError);
        });

        it('should propagate unexpected errors', async () => {
            mockTraineeService.create.mockRejectedValue(createFailedError);
            await expect(traineeController.create(traineeCreateResponse.data, F.LANG)).rejects.toThrow(createFailedError);
        });

        it('should throw BadRequestException for invalid DTO', async () => {
            const invalidDto = { userName: 'onlyName' } as any;
            mockTraineeService.create.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.create(invalidDto, F.LANG)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            mockTraineeService.create.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.create(traineeCreateResponse.data, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.create(traineeCreateResponse.data, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });
    });

    describe('update', () => {
        it('should update a trainee', async () => {

            mockTraineeService.update.mockResolvedValue(traineeUpdateResponse);
            const result = await traineeController.update(traineeId, updateDto, F.LANG);
            expect(result).toEqual(traineeUpdateResponse);
            expect(mockTraineeService.update).toHaveBeenCalledWith(traineeId.userId, updateDto, F.LANG);
            expect(result.data).toMatchObject(traineeUpdateResponse.data);
            expect(result.success).toEqual(traineeUpdateResponse.success);
        });

        it('should throw BadRequestException for empty body', async () => {
            mockTraineeService.update.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, {}, F.LANG)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw NotFoundException if id not found', async () => {
            mockTraineeService.update.mockRejectedValue(userNotFoundError);
            await expect(traineeController.update({ userId: 999 }, updateDto, F.LANG)).rejects.toThrow(userNotFoundError);
        });

        it('should throw error for invalid id', async () => {
            const invalidId = { userId: 'invalid' } as unknown as userIdDto;
            mockTraineeService.update.mockRejectedValue(userNotFoundError);
            await expect(traineeController.update(invalidId, updateDto, F.LANG)).rejects.toThrow(userNotFoundError);
        });

        it('should throw BadRequestException when email already exists', async () => {
            mockTraineeService.update.mockRejectedValue(emailExistsError);
            await expect(traineeController.update(traineeId, updateDtoEmail, F.LANG)).rejects.toThrow(emailExistsError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            mockTraineeService.update.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, updateDto, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, updateDto, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should propagate unexpected errors', async () => {
            mockTraineeService.update.mockRejectedValue(updateFailedError);
            await expect(traineeController.update(traineeId, updateDto, F.LANG)).rejects.toThrow(updateFailedError);
        });
    });

    describe('delete', () => {
        it('should delete a trainee', async () => {
            mockTraineeService.delete.mockResolvedValue(traineeDeleteResponse);
            const result = await traineeController.delete(traineeId, F.LANG);
            expect(result).toEqual(traineeDeleteResponse);
            expect(mockTraineeService.delete).toHaveBeenCalledWith(traineeId.userId, F.LANG);
            expect(result).toMatchObject(traineeDeleteResponse);
        });

        it('should throw NotFoundException if id not found', async () => {
            mockTraineeService.delete.mockRejectedValue(deleteNotAllowedError);
            await expect(traineeController.delete({ userId: 999 }, F.LANG)).rejects.toThrow(deleteNotAllowedError);
        });

        it('should throw error for invalid id', async () => {
            const invalidId = { userId: 'invalid' } as unknown as userIdDto;
            mockTraineeService.delete.mockRejectedValue(deleteNotAllowedError);
            await expect(traineeController.delete(invalidId, F.LANG)).rejects.toThrow(deleteNotAllowedError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            mockTraineeService.delete.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.delete(traineeId, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.delete(traineeId, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should propagate unexpected errors', async () => {
            mockTraineeService.delete.mockRejectedValue(deleteFailedError);
            await expect(traineeController.delete(traineeId, F.LANG)).rejects.toThrow(deleteFailedError);
        });
    });
});
