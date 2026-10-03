import EventEmitter from 'events';
import { Job, IJob } from '../models/Job';

type JobHandler = (
  job: IJob,
  updateProgress: (progress: number, stepMessage: string) => Promise<void>
) => Promise<any>;

export class JobQueueService extends EventEmitter {
  private handlers: Map<string, JobHandler> = new Map();
  private processing: boolean = false;
  private queue: string[] = []; // Job IDs

  constructor() {
    super();
  }

  public registerHandler(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  public async enqueue(
    projectId: string,
    userId: string,
    type: 'footage_analysis' | 'clip_proposal' | 'auto_draft' | 'render_export' | 'platform_adaptation'
  ): Promise<IJob> {
    const job = await Job.create({
      projectId,
      userId,
      type,
      status: 'queued',
      progress: 0,
      currentStepMessage: 'Job queued...',
    });

    this.queue.push(job.id);
    this.processNext();
    return job;
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const jobId = this.queue.shift();
    if (!jobId) {
      this.processing = false;
      return;
    }

    try {
      const job = await Job.findById(jobId);
      if (!job) {
        this.processing = false;
        this.processNext();
        return;
      }

      job.status = 'processing';
      job.progress = 5;
      job.currentStepMessage = 'Initializing task...';
      await job.save();

      const handler = this.handlers.get(job.type);
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      const updateProgress = async (progress: number, stepMessage: string) => {
        const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));
        await Job.updateOne(
          { _id: job._id },
          { $set: { progress: roundedProgress, currentStepMessage: stepMessage } }
        );
        this.emit('progress', { jobId: job.id, progress: roundedProgress, stepMessage });
      };

      const result = await handler(job, updateProgress);

      await Job.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'completed',
            progress: 100,
            currentStepMessage: 'Completed successfully',
            resultPayload: result,
          },
        }
      );

      this.emit('completed', { jobId: job.id, result });
    } catch (err: any) {
      console.error(`Error executing job ${jobId}:`, err);
      const job = await Job.findById(jobId);
      if (job) {
        const newRetries = (job.retries || 0) + 1;
        if (newRetries <= job.maxRetries) {
          console.log(`Retrying job ${jobId} (Attempt ${newRetries} of ${job.maxRetries})...`);
          await Job.updateOne(
            { _id: job._id },
            {
              $set: {
                status: 'queued',
                retries: newRetries,
                currentStepMessage: `Retrying task (Attempt ${newRetries})...`,
              },
            }
          );
          this.queue.push(job.id);
        } else {
          await Job.updateOne(
            { _id: job._id },
            {
              $set: {
                status: 'failed',
                retries: newRetries,
                errorMessage: err?.message || 'Unknown processing error',
                currentStepMessage: 'Failed after maximum retries',
              },
            }
          );
          this.emit('failed', { jobId: job.id, error: err?.message });
        }
      }
    } finally {
      this.processing = false;
      this.processNext();
    }
  }
}

export const jobQueueService = new JobQueueService();
