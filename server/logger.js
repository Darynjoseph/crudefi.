const fs = require('fs');
const path = require('path');
const util = require('util');

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create a write stream (in append mode)
const logFile = path.join(logDir, 'server.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Override console.log to write to both console and file
const originalConsoleLog = console.log;
console.log = function(...args) {
  const timestamp = new Date().toISOString();
  const message = util.format(...args);
  
  // Write to console
  originalConsoleLog(`[${timestamp}]`, ...args);
  
  // Write to file
  logStream.write(`[${timestamp}] ${message}\n`);
};

// Override console.error to write to both console and file
const originalConsoleError = console.error;
console.error = function(...args) {
  const timestamp = new Date().toISOString();
  const message = util.format(...args);
  
  // Write to console
  originalConsoleError(`[${timestamp}] [ERROR]`, ...args);
  
  // Write to file
  logStream.write(`[${timestamp}] [ERROR] ${message}\n`);
};

// Handle process exit
process.on('exit', () => {
  logStream.end('\nServer stopped\n');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log(`Logging to ${logFile}`);
module.exports = { logStream };
