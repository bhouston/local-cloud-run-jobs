import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// types.ts
export type JobStatus = 'CREATED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'UPDATED';

/*
// Properties of a GetJobRequest.
interface IGetJobRequest {

    // GetJobRequest name
    name?: (string|null);
}
*/
export type IGetJobRequest = {
    name: string;
}

/*
// Properties of a DeleteJobRequest
interface IDeleteJobRequest {

    // DeleteJobRequest name
    name?: (string|null);

    // DeleteJobRequest validateOnly
    validateOnly?: (boolean|null);

    // DeleteJobRequest etag
    etag?: (string|null);
}
*/
export type IDeleteJobRequest = {
    name: string;
    validateOnly: boolean;
    etag: string;
}

/*
// Properties of a Job.
interface IJob {

    //Job name 
    name?: (string|null);

    //Job uid 
    uid?: (string|null);

    //Job generation
    generation?: (number|Long|string|null);

    //Job labels
    labels?: ({ [k: string]: string }|null);

    //Job annotations 
    annotations?: ({ [k: string]: string }|null);

    //Job createTime
    createTime?: (google.protobuf.ITimestamp|null);

    //Job updateTime 
    updateTime?: (google.protobuf.ITimestamp|null);

    //Job deleteTime
    deleteTime?: (google.protobuf.ITimestamp|null);

    //Job expireTime
    expireTime?: (google.protobuf.ITimestamp|null);

    //Job creator 
    creator?: (string|null);

    //Job lastModifier 
    lastModifier?: (string|null);

    //Job client 
    client?: (string|null);

    //Job clientVersion 
    clientVersion?: (string|null);

    //Job launchStage 
    launchStage?: (google.api.LaunchStage|keyof typeof google.api.LaunchStage|null);

    //Job binaryAuthorization 
    binaryAuthorization?: (google.cloud.run.v2.IBinaryAuthorization|null);

    //Job template 
    template?: (google.cloud.run.v2.IExecutionTemplate|null);

    //Job observedGeneration 
    observedGeneration?: (number|Long|string|null);

    //Job terminalCondition
    terminalCondition?: (google.cloud.run.v2.ICondition|null);

    //Job conditions 
    conditions?: (google.cloud.run.v2.ICondition[]|null);

    //Job executionCount
    executionCount?: (number|null);

    //Job latestCreatedExecution
    latestCreatedExecution?: (google.cloud.run.v2.IExecutionReference|null);

    //Job reconciling 
    reconciling?: (boolean|null);

    //Job satisfiesPzs 
    satisfiesPzs?: (boolean|null);

    //Job startExecutionToken
    startExecutionToken?: (string|null);

    //Job runExecutionToken 
    runExecutionToken?: (string|null);

    //Job etag 
    etag?: (string|null);
}
*/
export type ILocalJob = {
    name: string;
    uid: string;
    labels: { [k: string]: string };
    annotations: { [k: string]: string };
    createTime: Date;
    updateTime: Date;
    deleteTime: Date;
    creator: string;
    lastModifier: string;
    executionCount: number;
    etag: string;
    command: string,
    arguments: string[]  
};

/*
// Properties of a CreateJobRequest.
interface ICreateJobRequest {

    // CreateJobRequest parent
    parent?: (string|null);

    /// CreateJobRequest job
    job?: (google.cloud.run.v2.IJob|null);

    // CreateJobRequest jobId
    jobId?: (string|null);

    // CreateJobRequest validateOnly
    validateOnly?: (boolean|null);
}
*/
export type ICreateJobRequest = {
 // Required. The location and project in which this Job should be created.
  // Format: projects/{project}/locations/{location}, where {project} can be
  // project id or number.
  parent: string;
  job: ILocalJob;
   // Required. The unique identifier for the Job. The name of the job becomes
  // {parent}/jobs/{job_id}.
  jobId: string;
  validateOnly: boolean;
}

/*
// Properties of a RunJobRequest.
interface IRunJobRequest {

    // RunJobRequest name
    name?: (string|null);

    // RunJobRequest validateOnly
    validateOnly?: (boolean|null);

    // RunJobRequest etag
    etag?: (string|null);

    // RunJobRequest overrides
    overrides?: (google.cloud.run.v2.RunJobRequest.IOverrides|null);
}
*/
export type IRunJobRequest = {
    name: string;
    validateOnly: boolean;
    etag: string;
}

/*
// Properties of an UpdateJobRequest.
interface IUpdateJobRequest {

    // UpdateJobRequest job
    job?: (google.cloud.run.v2.IJob|null);

    // UpdateJobRequest validateOnly
    validateOnly?: (boolean|null);

    // UpdateJobRequest allowMissing
    allowMissing?: (boolean|null);
}
*/
export type IUpdateJobRequest = {
    job: IJob | ILocalJob;
    validateOnly: boolean;
    allowMissing: boolean;
}

/*
// Properties of a ListJobsRequest.
interface IListJobsRequest {

    // ListJobsRequest parent
    parent?: (string|null);

    // ListJobsRequest pageSize
    pageSize?: (number|null);

    // ListJobsRequest pageToken
    pageToken?: (string|null);

    // ListJobsRequest showDeleted
    showDeleted?: (boolean|null);
}
*/
export type IListJobsRequest = {
  parent: string;
  pageSize: number;
  pageToken: string;
  showDeleted: boolean;
};

export type Job = {
  name: string;
  parent: string;
  creationTime: Date;
  creator: string;
  executionCount: number;
  command: string;
  arguments: string[];
  status: JobStatus;
  labels: { [key: string]: string };
  output?: string;
};

export class LocalJobsClient {
  private jobs: Map<string, Job> = new Map();

  async createJob(request: ICreateJobRequest): Promise<Job> {
    const job: Job = {
      name: request.jobId,
      parent: request.parent,
      command: request.job.command,
      arguments: request.job.arguments,
      status: 'CREATED',
        creationTime: new Date(),
        creator: 'test',
        executionCount: 0,
        labels: {},

    };
    this.jobs.set(job.name, job);
    return job;
  }

  async runJob(jobId: string): Promise<Job> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job with ID ${jobId} not found`);

    job.status = 'RUNNING';
    try {
      const { stdout, stderr } = await execAsync(job.command);
      job.status = 'COMPLETED';
      job.output = stdout || stderr;
    } catch (error) {
      job.status = 'FAILED';
      job.output = error.message;
    }

    return job;
  }

  async getJob(jobId: string): Promise<Job | undefined> {
    return this.jobs.get(jobId);
  }

  async deleteJob(jobId: string): Promise<void> {
    if (!this.jobs.has(jobId)) throw new Error(`Job with ID ${jobId} not found`);
    this.jobs.delete(jobId);
  }

  async listJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async updateJob(jobId: string, updatedCommand: string): Promise<Job> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job with ID ${jobId} not found`);

    job.command = updatedCommand;
    job.status = 'UPDATED';
    return job;
  }
}
