# cloud-run-jobs-mock

A mock implementation of Cloud Run Jobs API for local development.

## Installation

```bash
npm install cloud-run-jobs-mock
```

## Usage

```ts
import { JobManager, JobSpec } from 'cloud-run-jobs-mock';

const jobManager = new JobManager();

// Create a job
const jobSpec: JobSpec = {
  name: 'render-scene',
  image: 'node', // For local mock, this can be a script path
  command: ['node'],
  args: ['renderScene.js'],
  env: { SCENE_ID: '12345' },
};

jobManager.createJob(jobSpec);

// Run the job
const execution = jobManager.runJob('render-scene');

// Monitor execution status
setInterval(() => {
  console.log(`Job Status: ${execution.status}`);
  if (execution.status === 'Succeeded' || execution.status === 'Failed') {
    clearInterval();
  }
}, 1000);
```