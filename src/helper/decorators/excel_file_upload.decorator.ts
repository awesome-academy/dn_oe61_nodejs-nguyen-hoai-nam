import {
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { maxSizeFile } from '../constants/cron_expression.constant';

export function ExcelFileUpload(fieldName = 'file') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: { fileSize: maxSizeFile },
        fileFilter: (req, file, cb) => {
          const allowedExtensions = /\.(xlsx|xls)$/i;
          if (!allowedExtensions.test(file.originalname)) {
            return cb(new Error('Only Excel files are allowed (xlsx, xls)!'), false);
          }
          cb(null, true);
        },
      })
    )
  );
}
