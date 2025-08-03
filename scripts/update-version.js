import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current timestamp
const now = new Date();
const timestamp = now.toISOString();
const buildId = `build-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

// Create version object
const versionData = {
  version: "1.0.0",
  timestamp: timestamp,
  buildId: buildId
};

// Write to version.json
const versionPath = path.join(__dirname, '..', 'public', 'version.json');
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));

console.log(`Updated version.json with build ID: ${buildId}`);
console.log(`Timestamp: ${timestamp}`); 