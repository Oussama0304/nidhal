module.exports = {
  collectCoverage: true,
  coverageReporters: ['lcov', 'clover', 'json'],
  testResultsProcessor: 'jest-sonar-reporter',
  reporters: ['default', 'jest-sonar'],
};
