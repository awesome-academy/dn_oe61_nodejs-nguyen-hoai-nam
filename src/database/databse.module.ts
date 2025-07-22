import { Module, Global, DynamicModule } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({})
export class DatabaseModule {
  static forRoot(options:any): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DataSource,
          useFactory: async () => {
            const dataSource = new DataSource(options);
            return dataSource
          }
        }
      ],
      exports: [DataSource]
    }
  }
}
