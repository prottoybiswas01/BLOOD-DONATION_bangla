import app from './src/index.js';

export default app;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

