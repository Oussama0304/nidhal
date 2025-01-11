module.exports = {
  collectCoverage: true,
  coverageReporters: ['lcov', 'clover', 'json'],
  testResultsProcessor: 'jest-sonar-reporter',
  reporters: ['default', 'jest-sonar'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleDirectories: ['node_modules', 'src'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    'src/setupTests.js',
    'src/reportWebVitals.js'
  ]
};
