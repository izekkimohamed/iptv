const fs = require('fs-extra');
const path = require('path');

const backendDist = path.join(__dirname, '../../backend/dist');
const backendNodeModules = path.join(__dirname, '../../backend/node_modules');
const resourcesBackend = path.join(__dirname, '../src-tauri/resources/backend');

async function copyBackend() {
  try {
    console.log('Copying backend to resources...');

    // Remove existing resources/backend
    await fs.remove(resourcesBackend);
    await fs.ensureDir(resourcesBackend);

    // Copy dist folder
    console.log('Copying dist folder...');
    await fs.copy(backendDist, path.join(resourcesBackend, 'dist'));

    // Copy node_modules (production only)
    console.log('Copying node_modules...');
    await fs.copy(backendNodeModules, path.join(resourcesBackend, 'node_modules'));

    console.log('✓ Backend bundled successfully');
  } catch (err) {
    console.error('Failed to copy backend:', err);
    process.exit(1);
  }
}

copyBackend();
