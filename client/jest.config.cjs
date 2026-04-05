module.exports = {
  testEnvironment: '<rootDir>/jest-environment-jsdom-fetch.cjs',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|until-async|outvariant|@open-draft)/)'
  ],
  testMatch: ['**/__tests__/**/*.test.jsx'],
};
