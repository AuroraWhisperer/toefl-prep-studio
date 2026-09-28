const { defineConfig } = require('@playwright/test');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const python = process.platform === 'win32' ? '.venv\\Scripts\\python.exe' : '.venv/bin/python';

const port = process.env.TOEFL_TEST_PORT || '8765';
const baseURL = `http://127.0.0.1:${port}`;
// Workers reload this configuration; keep the runner's owned data root across processes.
const dataRoot = path.resolve('artifacts/qa/browser-data');
const dataDirectory = path.resolve(
  process.env.TOEFL_BROWSER_DATA_DIR || path.join(dataRoot, randomUUID()),
);
if (
  path.dirname(dataDirectory) !== dataRoot ||
  !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(path.basename(dataDirectory))
) {
  throw new Error('Browser test data must use a UUID directory inside artifacts/qa/browser-data');
}
process.env.TOEFL_BROWSER_DATA_DIR = dataDirectory;

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'browser_*.test.cjs',
  workers: 1,
  timeout: 60000,
  reporter: 'list',
  outputDir: 'artifacts/qa/browser-tests',
  globalTeardown: require.resolve('./tests/browser_cleanup.cjs'),
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    env: { TOEFL_DATA_DIR: dataDirectory },
    command: `${python} -m uvicorn backend.app:app --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}/`,
    reuseExistingServer: false,
    timeout: 15000,
  },
});
