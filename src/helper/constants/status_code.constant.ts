import * as dotenv from 'dotenv';
dotenv.config();

export const StatusCodes = {
    SUCCESS: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    ERROR: 500,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403
} as const;

export const MsgCode = {
    SUCCESS: ["success", "SUCCESS"],
    NOTFOUND: ["not_found", "NOT_FOUND"],
    ERROR: ["error", "ERROR"],
    BAD_REQUEST: ["bad_request", "BAD_REQUEST"],
    UNAUTHORIZED: ["unauthorized", "UNAUTHORIZED"],
    FORBIDDEN: ["forbidden", "FORBIDDEN"],
    CONFLICT: ["conflict", "CONFLICT"], 
    VALIDATION_ERROR: ["validation_error", "VALIDATION_ERROR"],
} as const;


export type StatusCodeType = typeof StatusCodes;
export type MsgCodeType = typeof MsgCode;
