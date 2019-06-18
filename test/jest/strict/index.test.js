const webpack = require('webpack');
const assert = require('assert');
const MakeConfig = require('./make.webpack.config');

describe('Simple dependency tree', () => {
  it('should output warnings if strict', (done) => {
    webpack(MakeConfig(), (err, stats) => {
      assert(stats.compilation.warnings.length === 2);
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      expect(stats.compilation.warnings[1].message).toMatchSnapshot();
      done();
    });
  });

  it('should not output warnings if not strict', (done) => {
    webpack(
      MakeConfig({
        strict: false,
      }),
      (err, stats) => {
        assert(stats.compilation.warnings.length === 1);
        expect(stats.compilation.warnings[0].message).toMatchSnapshot();
        done();
      },
    );
  });
});
