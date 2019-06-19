const webpack = require('webpack');
const assert = require('assert');
const chalk = require('chalk');
const config = require('./webpack.config');

describe('npm v2 packages', () => {
  beforeEach(() => {
    chalk.enabled = false;
  });

  afterEach(() => {
    chalk.enabled = true;
  });

  it('should not output warnings', (done) => {
    webpack(config, (err, stats) => {
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });
});
