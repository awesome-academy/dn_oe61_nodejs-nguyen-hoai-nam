import { Test } from '@nestjs/testing';
import { TraineeController } from '../../../src/api/user/trainee/trainee.controller';
import { TraineeService } from '../../../src/api/user/trainee/trainee.service';
import * as F from './dto/trainee.fixture';
import { expectPagination } from './dto/test_helpers';
import { userIdDto } from '../../../src/validation/class_validation/user.validation';
import { traineeId, updateDto, updateDtoEmail } from './constants/trainee_test.constant';
import { emailExistsError, createFailedError, missingRequiredFieldsError, userNotFoundError, updateFailedError, deleteNotAllowedError, deleteFailedError, noTraineesFoundError, databaseConnectionLostError } from './constants/error.constant';
import { traineeCreateResponse, traineeUpdateResponse, traineeDeleteResponse } from './response/trainee.response';

describe('TraineeController [DI/auto]', () => {
    let traineeController: TraineeController;
    let traineeService: jest.Mocked<TraineeService>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [TraineeController],
        })
            .useMocker(token => {
                if (token === TraineeService) {
                    return {
                        getAll: jest.fn(),
                        getById: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    } as unknown as TraineeService;
                }
                return {};
            })
            .compile();

        traineeController = moduleRef.get(TraineeController);
        traineeService = moduleRef.get(TraineeService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return an array of trainees', async () => {

            const expectedResult = F.SUCCESS_GET_ALL;
            traineeService.getAll.mockResolvedValue(expectedResult);

            const result = await traineeController.getAll(F.LANG, F.PAGINATION);
            expect(result).toEqual(expectedResult);
            expectPagination(result, F.META);
            expect(traineeService.getAll).toHaveBeenCalledWith(F.LANG, 1, 10);
        });

        it('should throw an error if service fails', async () => {
            traineeService.getAll.mockRejectedValue(noTraineesFoundError);
            await expect(traineeController.getAll(F.LANG, F.PAGINATION)).rejects.toThrow(noTraineesFoundError);
        });

        it('should propagate unexpected errors', async () => {
            const err = databaseConnectionLostError;
            traineeService.getAll.mockRejectedValue(err);
            await expect(traineeController.getAll(F.LANG, F.PAGINATION)).rejects.toThrow(err);
        });

        it('should throw BadRequestException for invalid pagination', async () => {
            traineeService.getAll.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.getAll(F.LANG, F.INVALID_PAGINATION)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.getAll(F.LANG, F.INVALID_PAGINATION2)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            traineeService.getAll.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.getAll(null as unknown as string, F.PAGINATION)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.getAll('jp' as unknown as string, F.PAGINATION)).rejects.toThrow(missingRequiredFieldsError);
        });
    });

    describe('getById', () => {
        it('should return a single trainee', async () => {

            const traineeId: userIdDto = { userId: 1 };
            const expectedResult = F.EXPECTED_RESULT;
            traineeService.getById.mockResolvedValue(expectedResult);
            const result = await traineeController.getById(traineeId, F.LANG);
            expect(result).toEqual(expectedResult);
            expect(traineeService.getById).toHaveBeenCalledWith(traineeId.userId, F.LANG);
        });

        it('should throw NotFoundException if trainee not found', async () => {

            const traineeId: userIdDto = { userId: 999 };
            const error = userNotFoundError;
            traineeService.getById.mockRejectedValue(error);
            await expect(traineeController.getById(traineeId, F.LANG)).rejects.toThrow(error);
        });

        it('should propagate unexpected errors', async () => {
            const err = databaseConnectionLostError;
            traineeService.getById.mockRejectedValue(err);
            await expect(traineeController.getById(traineeId, F.LANG)).rejects.toThrow(err);
        });

        it('should throw BadRequestException for invalid language', async () => {
            traineeService.getById.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.getById(traineeId, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.getById(traineeId, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw error for invalid userId', async () => {
            const invalidId = { userId: 'invalid' } as unknown as userIdDto;
            traineeService.getById.mockRejectedValue(userNotFoundError);
            await expect(traineeController.getById(invalidId, F.LANG)).rejects.toThrow(userNotFoundError);
        });
    });

    describe('create', () => {
        it('should create a new trainee', async () => {

            traineeService.create.mockResolvedValue(traineeCreateResponse);
            const result = await traineeController.create(traineeCreateResponse.data, F.LANG);
            expect(result).toEqual(traineeCreateResponse);
            expect(traineeService.create).toHaveBeenCalledWith(traineeCreateResponse.data, F.LANG);
        });

        it('should throw BadRequestException if email exists', async () => {
            traineeService.create.mockRejectedValue(emailExistsError);
            await expect(traineeController.create(traineeCreateResponse.data, F.LANG)).rejects.toThrow(emailExistsError);
        });

        it('should propagate unexpected errors', async () => {
            traineeService.create.mockRejectedValue(createFailedError);
            await expect(traineeController.create(traineeCreateResponse.data, F.LANG)).rejects.toThrow(createFailedError);
        });

        it('should throw BadRequestException for invalid DTO', async () => {
            const invalidDto = { userName: 'onlyName' } as any;
            traineeService.create.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.create(invalidDto, F.LANG)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            traineeService.create.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.create(traineeCreateResponse.data, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.create(traineeCreateResponse.data, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });
    });

    describe('update', () => {
        it('should update a trainee', async () => {

            traineeService.update.mockResolvedValue(traineeUpdateResponse);
            const result = await traineeController.update(traineeId, updateDto, F.LANG);
            expect(result).toEqual(traineeUpdateResponse);
            expect(traineeService.update).toHaveBeenCalledWith(traineeId.userId, updateDto, F.LANG);
        });

        it('should throw BadRequestException for empty body', async () => {
            traineeService.update.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, {}, F.LANG)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw NotFoundException if id not found', async () => {
            traineeService.update.mockRejectedValue(userNotFoundError);
            await expect(traineeController.update({ userId: 999 }, updateDto, F.LANG)).rejects.toThrow(userNotFoundError);
        });

        it('should throw error for invalid id', async () => {
            const invalidId = { userId: 'invalid' } as unknown as userIdDto;
            traineeService.update.mockRejectedValue(userNotFoundError);
            await expect(traineeController.update(invalidId, updateDto, F.LANG)).rejects.toThrow(userNotFoundError);
        });

        it('should throw BadRequestException when email already exists', async () => {
            traineeService.update.mockRejectedValue(emailExistsError);
            await expect(traineeController.update(traineeId, updateDtoEmail, F.LANG)).rejects.toThrow(emailExistsError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            traineeService.update.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, updateDto, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, updateDto, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should propagate unexpected errors', async () => {
            traineeService.update.mockRejectedValue(updateFailedError);
            await expect(traineeController.update(traineeId, updateDto, F.LANG)).rejects.toThrow(updateFailedError);
        });
    });

    describe('delete', () => {
        it('should delete a trainee', async () => {
            traineeService.delete.mockResolvedValue(traineeDeleteResponse);
            const result = await traineeController.delete(traineeId, F.LANG);
            expect(result).toEqual(traineeDeleteResponse);
            expect(traineeService.delete).toHaveBeenCalledWith(traineeId.userId, F.LANG);
        });

        it('should throw NotFoundException if id not found', async () => {
            traineeService.delete.mockRejectedValue(deleteNotAllowedError);
            await expect(traineeController.delete({ userId: 999 }, F.LANG)).rejects.toThrow(deleteNotAllowedError);
        });

        it('should throw error for invalid id', async () => {
            const invalidId = { userId: 'invalid' } as unknown as userIdDto;
            traineeService.delete.mockRejectedValue(deleteNotAllowedError);
            await expect(traineeController.delete(invalidId, F.LANG)).rejects.toThrow(deleteNotAllowedError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            traineeService.delete.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.delete(traineeId, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.delete(traineeId, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should propagate unexpected errors', async () => {
            traineeService.delete.mockRejectedValue(deleteFailedError);
            await expect(traineeController.delete(traineeId, F.LANG)).rejects.toThrow(deleteFailedError);
        });
    });
});
