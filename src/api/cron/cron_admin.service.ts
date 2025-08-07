import { Injectable, NotFoundException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CronExpression } from 'src/helper/constants/cron_expression.constant';
import { I18nUtils } from 'src/helper/utils/i18n-utils';

export interface CronJobInfo {
  name: string;
  expression: string;
}

@Injectable()
export class CronAdminService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly i18n: I18nUtils,
  ) {}

  listJobs(): CronJobInfo[] {
    const jobs: CronJobInfo[] = [];
    this.schedulerRegistry.getCronJobs().forEach((job: CronJob, name: string) => {
      jobs.push({
        name,
        expression: (job as any).cronTime?.source || CronExpression.RUN,
      });
    });
    return jobs;
  }

  runNow(name: string, lang?: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    if (!job) throw new NotFoundException(this.i18n.translate('validation.cron.job_not_found', { name }, lang));
    job.fireOnTick();
  }
}
