// Jest setup for CI environment
if (process.env.CI) {
  // Increase timeout for CI environment
  jest.setTimeout(30000);
}

// Suppress console warnings in test environment
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('punycode')) {
    return;
  }
  originalConsoleError(...args);
};