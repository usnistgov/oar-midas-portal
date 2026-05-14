module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/src/**/*.spec.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$|oarng|jspdf|jspdf-autotable))'
  ],
  moduleNameMapper: {
    '^oarng$': '<rootDir>/../lib/dist/oarng/fesm2022/oarng.mjs'
  },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.spec.ts',
    '!src/main.ts',
    '!src/environments/**'
  ],
  coverageReporters: ['lcov', 'text-summary', 'json-summary'],
  coverageDirectory: 'coverage'
};
