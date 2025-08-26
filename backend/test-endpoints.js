import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5001';
let authToken = null;

// Test utilities
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const testEndpoint = async (name, url, options = {}) => {
  try {
    log(`Testing ${name}...`);
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();

    if (response.ok) {
      log(`✅ ${name} - Status: ${response.status}`, 'success');
      return { success: true, data, status: response.status };
    } else {
      log(`❌ ${name} - Status: ${response.status}, Error: ${data.message || 'Unknown error'}`, 'error');
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    log(`❌ ${name} - Network Error: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
};

const createTestImage = () => {
  // Create a simple test image buffer (1x1 pixel PNG)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
    0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  return pngBuffer;
};

const testImageUpload = async (endpoint, additionalFields = {}) => {
  try {
    const formData = new FormData();
    formData.append('image', createTestImage(), 'test.png');

    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });

    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const runTests = async () => {
  log('🚀 Starting CHUTKI API Endpoint Tests', 'info');
  log('=' * 50, 'info');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const test = async (name, testFn) => {
    results.total++;
    try {
      const result = await testFn();
      if (result.success) {
        results.passed++;
        log(`✅ ${name}`, 'success');
      } else {
        results.failed++;
        log(`❌ ${name} - ${result.error || result.data?.message || 'Failed'}`, 'error');
      }
    } catch (error) {
      results.failed++;
      log(`❌ ${name} - Exception: ${error.message}`, 'error');
    }
  };

  // 1. Health Check
  await test('Health Check', () => testEndpoint('Health Check', '/api/health'));

  // 2. Authentication Tests
  log('\n📝 Testing Authentication Endpoints...', 'info');

  await test('Register User', async () => {
    return testEndpoint('Register', '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!@#'
      })
    });
  });

  await test('Login User', async () => {
    const result = await testEndpoint('Login', '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@chutki.com',
        password: 'Demo123!'
      })
    });

    if (result.success && result.data?.data?.token) {
      authToken = result.data.data.token;
      log('🔑 Auth token obtained for subsequent tests', 'info');
    }

    return result;
  });

  // 3. Image Processing Tests
  log('\n🖼️  Testing Image Processing Endpoints...', 'info');

  await test('Passport Photo Generation', async () => {
    return testImageUpload('/api/passport-photo', {
      size: '35x45',
      dpi: '300',
      background: 'white',
      format: 'jpeg',
      quantity: '1'
    });
  });

  await test('Image Rotation', async () => {
    return testImageUpload('/api/tools/rotate', {
      angle: '90',
      background: 'white'
    });
  });

  await test('Image Flip', async () => {
    return testImageUpload('/api/tools/flip', {
      direction: 'horizontal'
    });
  });

  await test('Image Resize (cm)', async () => {
    return testImageUpload('/api/tools/resize-cm', {
      width: '10',
      height: '15',
      unit: 'cm',
      dpi: '300'
    });
  });

  await test('Image Upload', async () => {
    return testImageUpload('/api/upload');
  });

  await test('Image Compression', async () => {
    return testImageUpload('/api/compress', {
      quality: '80',
      format: 'jpeg'
    });
  });

  await test('Image Conversion', async () => {
    return testImageUpload('/api/convert', {
      format: 'png'
    });
  });

  // 4. Protected Route Tests (if auth token available)
  if (authToken) {
    log('\n🔒 Testing Protected Endpoints...', 'info');

    await test('User Profile', () => testEndpoint('Profile', '/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }));
  }

  // 5. Error Handling Tests
  log('\n⚠️  Testing Error Handling...', 'info');

  await test('Invalid Endpoint', async () => {
    const result = await testEndpoint('Invalid Endpoint', '/api/nonexistent');
    return { success: result.status === 404 };
  });

  await test('Invalid Image Upload', async () => {
    const formData = new FormData();
    formData.append('image', Buffer.from('not an image'), 'test.txt');

    const response = await fetch(`${BASE_URL}/api/passport-photo`, {
      method: 'POST',
      body: formData
    });

    return { success: !response.ok }; // Should fail
  });

  // Results Summary
  log('\n' + '=' * 50, 'info');
  log('📊 Test Results Summary', 'info');
  log('=' * 50, 'info');
  log(`Total Tests: ${results.total}`, 'info');
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`,
    results.failed === 0 ? 'success' : 'warning');

  if (results.failed === 0) {
    log('🎉 All tests passed! CHUTKI backend is ready for production.', 'success');
  } else {
    log(`⚠️  ${results.failed} test(s) failed. Please review the errors above.`, 'warning');
  }

  process.exit(results.failed === 0 ? 0 : 1);
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    log(`💥 Test runner crashed: ${error.message}`, 'error');
    process.exit(1);
  });
}

export default runTests;
