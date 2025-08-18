import { traineeResponse } from "../response/trainee.response";

export const LANG = 'en';
export const PAGINATION = { page: 1, pageSize: 10 } as const;
export const INVALID_PAGINATION = { page: -1, pageSize: 0 } as const;
export const INVALID_PAGINATION2 = { page: 10000, pageSize: 10000 } as const;
export const TRAINEE_ITEM = traineeResponse.data;
export const META = {
    totalItems: 1,
    itemCount: 1,
    currentPage: 1,
    itemsPerPage: PAGINATION.pageSize,
    totalPages: 1,
} as const;

export const SUCCESS_GET_ALL = {
    success: true,
    message: '',
    data: {
        items: [TRAINEE_ITEM],
        meta: META,
    },
} as const;

export const EXPECTED_RESULT = {
    success: true,
    message: '',
    data: TRAINEE_ITEM,
} as const;
