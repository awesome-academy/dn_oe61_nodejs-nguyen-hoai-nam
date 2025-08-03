import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MailJobData } from 'src/helper/interface/reporting.interface';

@Injectable()
export class MailQueueService {
  constructor(@InjectQueue('mailQueue') private mailQueue: Queue) { }

  async enqueueMailJob(data: MailJobData) {
    await this.mailQueue.add('sendReminderEmail', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
