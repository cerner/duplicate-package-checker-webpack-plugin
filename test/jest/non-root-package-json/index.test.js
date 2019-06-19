const webpack = require('webpack');
const chalk = require('chalk');
const config = require('./webpack.config');

describe('Dependency tree with non-root package.json', () => {
  beforeEach(() => {
    chalk.enabled = false;
  });

  afterEach(() => {
    chalk.enabled = true;
  });

  it('should output warnings', (done) => {
    webpack(config, (err, stats) => {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      done();
    });
  });
});
