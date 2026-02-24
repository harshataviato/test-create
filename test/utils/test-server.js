/**
 * Ensures the server is running for integration tests.
 * Since server.js does not export the app, we require it to trigger execution
 * and wait for it to be ready.
 */
const net = require('net');

let serverStarted = false;

const startServer = async () => {
  if (serverStarted) return;

  // Set env to test to avoid polluting dev db if logic existed
  process.env.NODE_ENV = 'test'; 
  process.env.PORT = 8081; // Use a different port for testing to avoid conflicts

  // Check if port is already in use
  const isPortTaken = await new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', err => (err.code === 'EADDRINUSE' ? resolve(true) : resolve(false)))
      .once('listening', () => tester.close(() => resolve(false)))
      .listen(process.env.PORT);
  });

  if (!isPortTaken) {
    // Require server to start it
    // We suppress console logs to keep test output clean
    const originalLog = console.log;
    // console.log = () => {}; 
    require('../../server');
    // console.log = originalLog;
    
    // Give it a moment to sync DB and listen
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  serverStarted = true;
};

module.exports = {
  startServer,
  baseUrl: `http://localhost:${process.env.PORT || 8081}`
};
