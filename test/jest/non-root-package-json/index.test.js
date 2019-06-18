const webpack = require('webpack');
const config = require('./webpack.config');

describe('Dependency tree with non-root package.json', () => {
  it('should output warnings', (done) => {
    webpack(config, (err, stats) => {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      done();
    });
  });
});
