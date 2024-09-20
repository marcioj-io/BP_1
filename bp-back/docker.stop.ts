const args = process.argv.slice(3);
const environment = args[0]; // 'dev' or 'test'

/**
 * Stops a running Docker container with the specified name.
 * It first checks if the container is running and then issues a stop command to it.
 *
 * @param {string} containerName - The name of the Docker container to be stopped.
 *
 * @example
 * stopDockerContainer('my-container');
 */
function stopDockerContainer(containerName) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const exec = require('child_process').exec;

  exec(`docker ps -q --filter name=${containerName}`, (err, stdout, stderr) => {
    if (stdout) {
      console.log(`Stopping container: ${containerName}`);
      exec(`docker stop ${stdout.trim()}`);
    } else {
      console.log(`Container not running: ${containerName}`);
    }
  });
}

try {
  if (environment && environment.toUpperCase() === 'DEV') {
    stopDockerContainer('pg_dev_container');
    stopDockerContainer('mongodb_container');
  } else if (environment && environment.toUpperCase() === 'TEST') {
    stopDockerContainer('pg_test_container');
    stopDockerContainer('mongodb_test_container');
  } else {
    console.log('Invalid environment specified');
  }
} catch (err) {
  console.log('Error stoping docker', err);
}
