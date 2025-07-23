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
    NOTFOUND: ["not found", "NOT FOUND"],
    ERROR: ["error", "ERROR"],
} as const;


export type StatusCodeType = typeof StatusCodes;
export type MsgCodeType = typeof MsgCode;
