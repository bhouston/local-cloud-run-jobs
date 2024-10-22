// example/usageExample.ts
import { JobManager, JobSpec } from 'cloud-run-jobs-mock';

async function main() {
  const jobManager = new JobManager();

  // Define the job specification
  const jobSpec: JobSpec = {
    name: 'render-blender-scene',
    image: 'python', // Assuming a local Python script
    command: ['python'],
    args: ['render_blender_scene.py'],
    env: {
      SCENE_FILE: 'scene.blend',
      OUTPUT_PATH: './output/',
    },
  };

  // Create the job
  const job = jobManager.createJob(jobSpec);
  console.log(`Created job: ${job.spec.name}`);

  // Run the job
  const execution = jobManager.runJob(job.spec.name);
  console.log(`Job ${job.spec.name} started at ${execution.startTime}`);

  // Monitor the job execution
  const interval = setInterval(() => {
    console.log(`Current status of ${job.spec.name}: ${execution.status}`);
    if (execution.status === 'Succeeded' || execution.status === 'Failed') {
      console.log(`Job ${job.spec.name} finished with status: ${execution.status}`);
      clearInterval(interval);
    }
  }, 2000);
}

main();
