import { spawn } from 'child_process';

export type IGetJobRequest = {
    name: string;
}

export type IDeleteJobRequest = {
    name: string;
}

export type ICreateJobRequest = {
  parent: string,
  jobId: string,
  validateOnly: boolean,
}

export type IListJobsRequest = {
  parent: string | null,
  pageSize: number | null,
  pageToken: string | null,
  showDeleted: boolean | null,
};

export type IJob = {
  name: string,
  creationTime: Date,
  creator: string,
  executionCount: number,
  labels: { [key: string]: string },
};

export class JobsClient {
  private jobs: Map<string, Job> = new Map();
  private executions: Map<string, Execution> = new Map();

  /*close() {
    this.jobs.clear();
    this.executions.clear();
  }*/

  /*createJob(spec: JobSpec): Job {
    const job = new Job(spec);
    this.jobs.set(spec.name, job);
    return job;
  }

  createJob(name: string): Execution {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job ${name} does not exist.`);
    }
    const execution = new Execution(job);
    this.executions.set(name, execution);
    this.executeJob(execution);
    return execution;
  }*/

  async createJob( request: ICreateJobRequest ) {
    const job = new Job(request.job);
    this.jobs.set(request.jobId, job);
    return job;
  }

  private executeJob(execution: Execution) {
    execution.status = 'Running';
    const { image, command = [], args = [], env = {} } = execution.job.spec;

    // For local execution, we'll simulate running the containerized job
    // Here, we'll assume `image` is a local script path for simplicity
    const child = spawn(image, [...command, ...args], { env: { ...process.env, ...env } });

    child.stdout.on('data', (data) => {
      console.log(`[${execution.job.spec.name}] ${data}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`[${execution.job.spec.name}] ERROR: ${data}`);
    });

    child.on('close', (code) => {
      execution.endTime = new Date();
      execution.status = code === 0 ? 'Succeeded' : 'Failed';
      console.log(`[${execution.job.spec.name}] Execution ${execution.status}`);
    });
  }

  listJobs( request: IListJobsRequest ): Job[] {
    return Array.from(this.jobs.values());
  }

  getJob(request: IGetJobRequest): Job | undefined {
    return this.jobs.get(request.name);
  }

  async deleteJob(request: IDeleteJobRequest): boolean {
    return this.jobs.delete(request.name);
  }
}
