const webpack = require('webpack');
const assert = require('assert');
const config = require('./webpack.config');

describe('npm v2 packages', () => {
  it('should not output warnings', (done) => {
    webpack(config, (err, stats) => {
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });
});
