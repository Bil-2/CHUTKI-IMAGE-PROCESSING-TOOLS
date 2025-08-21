#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up CHUTKI Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please update the .env file with your actual configuration values.\n');
  } else {
    console.log('❌ env.example file not found. Please create a .env file manually.');
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Create uploads directory if it doesn't exist
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Uploads directory created successfully!\n');
} else {
  console.log('✅ Uploads directory already exists.\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('Run: npm install\n');
} else {
  console.log('✅ Dependencies are installed.\n');
}

console.log('🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update your .env file with your configuration');
console.log('2. Run: npm run dev');
console.log('3. Your server will be available at: http://localhost:5001');
console.log('4. Health check: http://localhost:5001/api/health\n');
