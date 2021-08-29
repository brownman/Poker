module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchPathIgnorePatterns: ['./node_modules/'],
  coveragePathIgnorePatterns: ['./node_modules/'],
  bail: true,
  testTimeout: 1000,
  // bail: 1,
  // setupFilesAfterEnv: ['./setup-after-env.js'],
};
