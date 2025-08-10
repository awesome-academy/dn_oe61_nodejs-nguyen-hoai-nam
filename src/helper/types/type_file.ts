declare namespace Express {
    export namespace Multer {
      interface File {
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }

export type MulterFile = Express.Multer.File;
