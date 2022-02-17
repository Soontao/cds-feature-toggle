
/**
 * @type {import("@jest/types").Config.ProjectConfig}
 */
module.exports = {
  testTimeout: 30 * 1000, // 30s
  transform: {
    ".ts": "ts-jest"
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!**/node_modules/**"
  ],
  coveragePathIgnorePatterns: [
    "node_modules/",
  ],
  testEnvironment: "node",
  testRegex: "/test/.*\\.test\\.ts$",
  moduleFileExtensions: [
    "ts",
    "js",
    "json"
  ]
};
