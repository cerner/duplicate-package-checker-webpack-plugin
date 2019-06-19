module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/*.js',
  ],
  testMatch: [
    '**/jest/**/(*.)(spec|test).js?(x)',
  ],
  roots: [process.cwd()],
  moduleDirectories: [
    'node_modules',
  ],
  testEnvironment: 'node',
};
