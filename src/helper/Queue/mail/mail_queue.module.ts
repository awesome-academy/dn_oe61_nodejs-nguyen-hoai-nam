import { BullModule } from '@nestjs/bull';
import { Logger, Module } from '@nestjs/common';
import { MailQueueProcessor } from './mail_queue.processor';
import { MailQueueService } from './mail_queue.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mailQueue',
    }),
    MailerModule,
  ],
  providers: [MailQueueProcessor, MailQueueService,Logger],
  exports: [MailQueueService],
})
export class MailQueueModule {}
