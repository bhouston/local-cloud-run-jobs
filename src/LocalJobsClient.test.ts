import { test, describe, before, after, it } from 'node:test';
import assert from 'node:assert/strict';
import { LocalJobsClient } from './LocalJobsClient'; // Local client
import { v2 } from '@google-cloud/run'; // Google Cloud client

type Client = LocalJobsClient | v2.JobsClient;

// Helper function to return either client based on the parameter
function createClient(type: 'local' | 'cloud'): Client {
  if (type === 'local') {
    return new LocalJobsClient();
  } else {
    return new v2.JobsClient();
  }
}

// Parameterized test suite
['local', 'cloud'].forEach((clientType) => {
  describe(`Job Client Tests (${clientType})`, () => {
    let client: Client;

    before(() => {
      client = createClient(clientType as 'local' | 'cloud');
    });

    it('should create a job', async () => {
      const command = clientType === 'local' ? 'echo "Hello, World!"' : undefined; // command for LocalJobsClient
      const image = clientType === 'cloud' ? 'gcr.io/your-project/blender-render-image' : undefined; // Docker image for JobsClient

      const jobRequest = clientType === 'local' 
        ? { command } 
        : { jobId: 'test-job', job: { template: { template: { containers: [{ image }] } } } };
      
      const job = await client.createJob(jobRequest);

      assert.ok(job);
      assert.equal(job.status, 'CREATED');
    });

    it('should run a job', async () => {
      const command = clientType === 'local' ? 'echo "Hello, World!"' : undefined;
      const image = clientType === 'cloud' ? 'gcr.io/your-project/blender-render-image' : undefined;

      const jobRequest = clientType === 'local' 
        ? { command } 
        : { jobId: 'test-job', job: { template: { template: { containers: [{ image }] } } } };
      
      const job = await client.createJob(jobRequest);
      const runningJob = await client.runJob(job.id);
      
      assert.equal(runningJob.status, 'COMPLETED');
      
      if (clientType === 'local') {
        assert.match(runningJob.output, /Hello, World!/);
      }
    });

    it('should list jobs', async () => {
      const jobs = await client.listJobs();
      assert.ok(Array.isArray(jobs));
    });

    it('should get a job status', async () => {
      const command = clientType === 'local' ? 'echo "Hello, World!"' : undefined;
      const image = clientType === 'cloud' ? 'gcr.io/your-project/blender-render-image' : undefined;

      const jobRequest = clientType === 'local' 
        ? { command } 
        : { jobId: 'test-job', job: { template: { template: { containers: [{ image }] } } } };
      
      const job = await client.createJob(jobRequest);
      const fetchedJob = await client.getJob(job.id);

      assert.ok(fetchedJob);
      assert.equal(fetchedJob?.status, 'CREATED');
    });

    it('should update a job', async () => {
      const command = clientType === 'local' ? 'echo "Hello, World!"' : undefined;
      const image = clientType === 'cloud' ? 'gcr.io/your-project/blender-render-image' : undefined;

      const jobRequest = clientType === 'local' 
        ? { command } 
        : { jobId: 'test-job', job: { template: { template: { containers: [{ image }] } } } };
      
      const job = await client.createJob(jobRequest);

      const updatedCommand = clientType === 'local' ? 'echo "Updated Command!"' : undefined;
      const updatedImage = clientType === 'cloud' ? 'gcr.io/your-project/updated-blender-render-image' : undefined;

      const updatedJob = await client.updateJob(job.id, clientType === 'local' ? updatedCommand : updatedImage);
      assert.equal(updatedJob.status, 'UPDATED');
    });

    it('should delete a job', async () => {
      const command = clientType === 'local' ? 'echo "Hello, World!"' : undefined;
      const image = clientType === 'cloud' ? 'gcr.io/your-project/blender-render-image' : undefined;

      const jobRequest = clientType === 'local' 
        ? { command } 
        : { jobId: 'test-job', job: { template: { template: { containers: [{ image }] } } } };
      
      const job = await client.createJob(jobRequest);

      await client.deleteJob(job.id);
      const deletedJob = await client.getJob(job.id);
      assert.equal(deletedJob, undefined);
    });
  });
});
