import { payLoadDataType } from '../interface/pay_load.interface';

declare module 'express' {
  interface Request {
    user?: payLoadDataType;
  }
}
