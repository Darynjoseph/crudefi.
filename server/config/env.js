const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file in the server directory
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  throw new Error(`Failed to load .env file: ${result.error}`);
}

// Get and validate database configuration
const getDbConfig = () => {
  console.log('Raw environment variables:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***set***' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV
  });

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  // Log the types of each config value
  console.log('Database config types:', {
    host: typeof config.host,
    port: typeof config.port,
    user: typeof config.user,
    password: typeof config.password,
    database: typeof config.database
  });

  // Validate required fields
  const required = ['host', 'port', 'user', 'password', 'database'];
  const missing = required.filter(field => {
    const missing = !config[field] && config[field] !== 0; // 0 is a valid port number
    if (missing) {
      console.error(`Missing required config: ${field}`);
    }
    return missing;
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required database config: ${missing.join(', ')}`);
  }

  // Ensure password is a string
  if (config.password && typeof config.password !== 'string') {
    console.log('Converting password to string');
    config.password = String(config.password);
  }

  return config;
};

module.exports = {
  getDbConfig,
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development'
};
