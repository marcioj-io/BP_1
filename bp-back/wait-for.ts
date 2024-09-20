console.log('Starting timeout for compose up database');

const timeout = 5000; // 5000 ms = 5 seconds

/**
 * Wait for 5 seconds before running the rest of the script.
 * To give time to database start.
 */
setTimeout(function () {
  console.log('Timeout finished');
}, timeout);
