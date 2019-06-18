const webpack = require('webpack');
const assert = require('assert');
const MakeConfig = require('./make.webpack.config');

describe('Simple dependency tree', () => {
  it('should output warnings', (done) => {
    webpack(MakeConfig(), (err, stats) => {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      expect(stats.compilation.warnings[1].message).toMatchSnapshot();
      assert(stats.compilation.warnings.length === 2);
      done();
    });
  });

  it('should output warnings in verbose', (done) => {
    webpack(MakeConfig({ verbose: true }), (err, stats) => {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      expect(stats.compilation.warnings[1].message).toMatchSnapshot();
      assert(stats.compilation.warnings.length === 2);
      done();
    });
  });

  it('should output errors', (done) => {
    webpack(MakeConfig({ emitError: true }), (err, stats) => {
      expect(stats.compilation.errors[0].message).toMatchSnapshot();
      expect(stats.compilation.errors[1].message).toMatchSnapshot();
      assert(stats.compilation.errors.length === 2);
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });

  it('should output errors in production mode', (done) => {
    webpack(MakeConfig({ emitError: true }, 'production'), (
      err,
      stats,
    ) => {
      expect(stats.compilation.errors[0].message).toMatchSnapshot();
      expect(stats.compilation.errors[1].message).toMatchSnapshot();
      assert(stats.compilation.errors.length === 2);
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });

  it('should ignore excluded duplicates by name', (done) => {
    webpack(
      MakeConfig({
        exclude(instance) {
          return instance.name === 'a';
        },
      }),
      (err, stats) => {
        expect(stats.compilation.warnings[0].message).toMatchSnapshot();
        assert(stats.compilation.warnings.length === 1);
        done();
      },
    );
  });

  it('should ignore excluded duplicates by issuer', (done) => {
    webpack(
      MakeConfig({
        exclude(instance) {
          return instance.issuer === './entry.js';
        },
      }),
      (err, stats) => {
        assert(stats.compilation.warnings.length === 0);
        done();
      },
    );
  });
  it('should respect showHelp option', (done) => {
    webpack(
      MakeConfig({
        showHelp: false,
      }),
      (err, stats) => {
        expect(stats.compilation.warnings[0]).toMatchSnapshot();
        expect(stats.compilation.warnings[1]).toMatchSnapshot();
        done();
      },
    );
  });
  it('should output errors if duplicate packages are found within alwaysEmitErrorsFor', (done) => {
    webpack(MakeConfig({ alwaysEmitErrorsFor: ['a'] }), (err, stats) => {
      expect(stats.compilation.errors[0].message).toMatchSnapshot();
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      assert(stats.compilation.errors.length === 1);
      assert(stats.compilation.warnings.length === 1);
      done();
    });
  });
});
