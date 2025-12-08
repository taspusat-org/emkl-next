// Jest configuration for global tests
const path = require('path');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: path.join(__dirname, '../..')
});

const customConfig = {
  displayName: 'Global Dashboard Tests',
  testMatch: ['**/__tests__/global/**/*.test.ts'],
  testEnvironment: 'node',
  verbose: true,
  rootDir: path.join(__dirname, '../..'),
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'app/dashboard/**/component/**/*.tsx',
    '!app/dashboard/**/component/**/*.test.tsx',
    '!app/dashboard/**/component/**/__tests__/**'
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/__tests__/integration/'
  ]
};

module.exports = createJestConfig(customConfig);
