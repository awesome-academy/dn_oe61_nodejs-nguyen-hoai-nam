import { Test, TestingModule } from '@nestjs/testing';
import { Type } from '@nestjs/common';
import { I18nUtils } from 'src/helper/utils/i18n-utils';
import { RolesGuard } from 'src/middleware/decentralization.middleware';
import { ModuleOpts } from '../interface/trainee_test.interface';

export function createMockService<T extends object>(methods: (keyof T)[]): jest.Mocked<T> {
  const mock = {} as Record<keyof T, jest.Mock>;
  methods.forEach((method) => {
    mock[method] = jest.fn();
  }); 
  return mock as unknown as jest.Mocked<T>;
}

export async function buildTestingModule<C, S extends object>(opts: ModuleOpts<C, S>): Promise<{ controller: C; serviceMock: jest.Mocked<S> }> {
  const serviceMock = createMockService<S>(opts.serviceMethods);

  const moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [opts.controller],
    providers: [
      { provide: opts.service, useValue: serviceMock },
      { provide: I18nUtils, useValue: { t: jest.fn((key: string) => key) } },
    ],
  })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  return {
    controller: moduleRef.get<C>(opts.controller),
    serviceMock,
  };
}

export const expectPagination = (
  res: { data?: { meta: unknown } },
  meta: unknown,
): void => {
  expect(res.data?.meta).toEqual(meta);
};
