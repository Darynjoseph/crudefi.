#!/usr/bin/env node
/**
 * Environment Setup Script
 * Run this script to create your .env file with required variables
 */

const fs = require('fs');
const crypto = require('crypto');

const envTemplate = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Update these with your actual database credentials)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=MyNewPassword123!
DB_NAME=crudefi_db

# JWT Configuration
JWT_SECRET=${crypto.randomBytes(64).toString('hex')}
JWT_EXPIRES_IN=24h

# Client Configuration
CLIENT_URL=http://localhost:5173

# Optional: Email Configuration (for password reset, notifications, etc.)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@example.com
# EMAIL_PASSWORD=your_email_password

# Optional: File Upload Configuration
# UPLOAD_DIR=uploads
# MAX_FILE_SIZE=5242880

# Optional: Logging
# LOG_LEVEL=info
`;

console.log('🔧 Setting up environment configuration...');

if (fs.existsSync('.env')) {
  console.log('⚠️  .env file already exists. Backup created as .env.backup');
  fs.copyFileSync('.env', '.env.backup');
}

fs.writeFileSync('.env', envTemplate);

console.log('✅ .env file created successfully!');
console.log('🔐 A secure JWT secret has been generated automatically.');
console.log('📝 Please update the database credentials in the .env file.');
console.log('');
console.log('Next steps:');
console.log('1. Update database configuration in .env');
console.log('2. Ensure your PostgreSQL database is running');
console.log('3. Run: npm start');
console.log('');
console.log('🚀 Your authentication system is ready to use!');