const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async config => {
  const directory = config.webServer.env.TOEFL_DATA_DIR;
  const root = path.resolve(__dirname, '../artifacts/browser-data');
  if (path.dirname(directory) !== root) throw new Error('Refusing to remove data outside the browser-test directory');
  await fs.rm(directory, { recursive: true, force: true });
};
