module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Handle .ts and .tsx files
  },
  testMatch: ["**/tests/**/*.test.ts"], // Path to your test files
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
