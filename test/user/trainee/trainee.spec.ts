import { TraineeController } from '../../../src/api/user/trainee/trainee.controller';
import { TraineeService } from '../../../src/api/user/trainee/trainee.service';
import { userIdDto } from '../../../src/validation/class_validation/user.validation';
import * as F from './dto/trainee.fixture';
import { createMockService } from './dto/test_helpers';
import { EXPECTED_RESULT } from './dto/trainee.fixture';
import { traineeId, updateDto, updateDtoEmail } from './constants/trainee_test.constant';
import { createFailedError, databaseConnectionLostError, deleteFailedError, deleteNotAllowedError, emailExistsError, missingRequiredFieldsError, noTraineesError, traineeNotFoundError, updateFailedError, userNotFoundError} from './constants/error.constant';
import { traineeCreateResponse, traineeDeleteResponse, traineeResponse, traineeUpdateResponse } from './response/trainee.response';

describe('TraineeController', () => {
    let traineeController: TraineeController;
    let traineeService: jest.Mocked<TraineeService>;

    beforeEach(() => {
        traineeService = createMockService<TraineeService>(['getAll', 'getById', 'create', 'update', 'delete']);
        traineeController = new TraineeController(traineeService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return list of trainees', async () => {

            const expectedResult = F.SUCCESS_GET_ALL;
            traineeService.getAll.mockResolvedValue(expectedResult);
            const result = await traineeController.getAll(F.LANG, F.PAGINATION);

            expect(result).toEqual(expectedResult);
            expect(result.data.meta).toEqual(F.META);
            expect(result.data.items).toEqual(expectedResult.data.items);
            expect(Array.isArray(result.data.items)).toBe(true);
            expect(result.data.items[0]).toMatchObject(expectedResult.data.items[0]);
            expect(traineeService.getAll).toHaveBeenCalledWith(F.LANG, 1, 10);
            expect(traineeService.getAll).toHaveBeenCalledTimes(1);
        });

        it('should throw error when service fails', async () => {
            traineeService.getAll.mockRejectedValue(noTraineesError);
            await expect(traineeController.getAll(F.LANG, F.PAGINATION)).rejects.toThrow(noTraineesError);
        });

        it('should throw NotFoundException when no trainees', async () => {
            traineeService.getAll.mockRejectedValue(noTraineesError);
            await expect(traineeController.getAll(F.LANG, F.PAGINATION)).rejects.toThrow(noTraineesError);
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
        it('should return a trainee', async () => {
            jest.spyOn(traineeService, 'getById').mockResolvedValue(EXPECTED_RESULT);
            const result = await traineeController.getById(traineeId, F.LANG);
            expect(result).toEqual(EXPECTED_RESULT);
            expect(result).toMatchObject(traineeResponse);
            expect(traineeService.getById).toHaveBeenCalledWith(traineeId.userId, F.LANG);
        });

        it('should throw NotFoundException when trainee not found', async () => {
            const traineeId: userIdDto = { userId: 999 };
            jest.spyOn(traineeService, 'getById').mockRejectedValue(traineeNotFoundError);
            await expect(traineeController.getById(traineeId, F.LANG)).rejects.toThrow(traineeNotFoundError);
        });

        it('should throw error for invalid userId', async () => {
            const traineeId = { userId: 'invalid' } as unknown as userIdDto;
            jest.spyOn(traineeService, 'getById').mockRejectedValue(traineeNotFoundError);
            await expect(traineeController.getById(traineeId, F.LANG)).rejects.toThrow(traineeNotFoundError);
        });

        it('should propagate unexpected errors from service', async () => {
            traineeService.getById.mockRejectedValue(databaseConnectionLostError);
            await expect(traineeController.getById(traineeId, F.LANG)).rejects.toThrow(databaseConnectionLostError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            traineeService.getById.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.getById(traineeId, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.getById(traineeId, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });
    });

    describe('create', () => {
        it('should create a trainee', async () => {
            jest.spyOn(traineeService, 'create').mockResolvedValue(traineeCreateResponse);

            const result = await traineeController.create(traineeCreateResponse.data, F.LANG);
            expect(result).toEqual(traineeCreateResponse);
            expect(traineeService.create).toHaveBeenCalledWith(traineeCreateResponse.data, F.LANG);
            expect(traineeService.create).toHaveBeenCalledTimes(1);

            expect(result.data).toMatchObject(traineeCreateResponse.data);
            expect(result.success).toEqual(traineeCreateResponse.success);
        });

        it('should throw BadRequestException when email already exists', async () => {
            traineeService.create.mockRejectedValue(emailExistsError);
            await expect(traineeController.create(traineeCreateResponse.data, F.LANG)).rejects.toThrow(emailExistsError);
        });

        it('should propagate unexpected errors from service', async () => {
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
            jest.spyOn(traineeService, 'update').mockResolvedValue(traineeUpdateResponse);
            const result = await traineeController.update(traineeId, updateDto, F.LANG);

            expect(result).toEqual(traineeUpdateResponse);
            expect(traineeService.update).toHaveBeenCalledWith(traineeId.userId, updateDto, F.LANG);
            expect(traineeService.update).toHaveBeenCalledTimes(1);
            expect(result.data).toMatchObject(traineeUpdateResponse.data);
            expect(result.success).toEqual(traineeUpdateResponse.success);
        });

        it('should throw BadRequestException when update body is empty', async () => {
            traineeService.update.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, {}, F.LANG)).rejects.toThrow(missingRequiredFieldsError);
        });

        it('should throw error for invalid id', async () => {
            const traineeId = { userId: 'invalid' } as unknown as userIdDto;
            jest.spyOn(traineeService, 'update').mockRejectedValue(traineeNotFoundError);
            await expect(traineeController.update(traineeId, updateDto, F.LANG)).rejects.toThrow(traineeNotFoundError);
        })

        it('should throw NotFoundException when trainee id not found', async () => {
            traineeService.update.mockRejectedValue(userNotFoundError);
            await expect(traineeController.update({ userId: 999 }, updateDto, F.LANG)).rejects.toThrow(userNotFoundError);
        });

        it('should throw BadRequestException when email already exists', async () => {
            traineeService.update.mockRejectedValue(emailExistsError);
            await expect(traineeController.update(traineeId, updateDtoEmail, F.LANG)).rejects.toThrow(emailExistsError);
        });

        it('should propagate unexpected errors from service', async () => {
            traineeService.update.mockRejectedValue(updateFailedError);
            await expect(traineeController.update(traineeId, updateDto, F.LANG)).rejects.toThrow(updateFailedError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            traineeService.update.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, updateDto, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.update(traineeId, updateDto, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });
    });

    describe('delete', () => {
        it('should delete a trainee', async () => {
            jest.spyOn(traineeService, 'delete').mockResolvedValue(traineeDeleteResponse);

            const result = await traineeController.delete(traineeId, F.LANG);
            expect(result).toEqual(traineeDeleteResponse);
            expect(traineeService.delete).toHaveBeenCalledWith(traineeId.userId, F.LANG);
            expect(traineeService.delete).toHaveBeenCalledTimes(1);
            expect(result).toMatchObject(traineeDeleteResponse);
        });

        it('should throw error for invalid id', async () => {
            const traineeId = { userId: 'invalid' } as unknown as userIdDto;
            jest.spyOn(traineeService, 'delete').mockRejectedValue(traineeNotFoundError);
            await expect(traineeController.delete(traineeId, F.LANG)).rejects.toThrow(traineeNotFoundError);
        })

        it('should throw NotFoundException when trainee does not exist', async () => {
            const traineeId: userIdDto = { userId: 999 };
            traineeService.delete.mockRejectedValue(deleteNotAllowedError);
            await expect(traineeController.delete(traineeId, F.LANG)).rejects.toThrow(deleteNotAllowedError);
        });

        it('should propagate unexpected errors from service', async () => {
            traineeService.delete.mockRejectedValue(deleteFailedError);
            await expect(traineeController.delete(traineeId, F.LANG)).rejects.toThrow(deleteFailedError);
        });

        it('should throw BadRequestException for invalid language', async () => {
            traineeService.delete.mockRejectedValue(missingRequiredFieldsError);
            await expect(traineeController.delete(traineeId, null as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
            await expect(traineeController.delete(traineeId, 'jp' as unknown as string)).rejects.toThrow(missingRequiredFieldsError);
        });
    });
});
