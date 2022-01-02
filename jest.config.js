/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',

  // TODO: Once the Datab global has been tamed a little, it should be able to run test concurrently
  maxConcurrency: 1,
  maxWorkers: 1,

  moduleNameMapper:{
    "^@Base/(.*)$": "<rootDir>/src/$1",
    "^@Entities/(.*)$": "<rootDir>/src/Entities/$1",
    "^@Monitoring/(.*)$": "<rootDir>/src/Monitoring/$1",
    "^@Route-Tools/(.*)$": "<rootDir>/src/route-tools/$1",
    "^@Tools/(.*)$": "<rootDir>/src/Tools/$1"
  }
};
