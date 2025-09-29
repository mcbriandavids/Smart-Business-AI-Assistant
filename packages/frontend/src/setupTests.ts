/// <reference types="jest" />

// ✅ Only executed in Jest environment
if (typeof jest !== "undefined") {
  // Increase timeout for CI environment
  jest.setTimeout(30000);
}

// Suppress console warnings in test environment
const originalConsoleError = console.error;

console.error = (...args: unknown[]) => {
  if (typeof args[0] === "string") {
    // Ignore punycode deprecation warnings
    if (args[0].includes("punycode")) return;

    // Ignore React 18+ warnings about ReactDOM.render
    if (args[0].includes("ReactDOM.render is no longer supported")) return;

    // Ignore act() warnings in React Testing Library
    if (
      args[0].includes("Warning: An update to") &&
      args[0].includes("inside a test was not wrapped in act(...)")
    ) {
      return;
    }
  }

  originalConsoleError(...args);
};
