import { beforeAll, afterAll, afterEach } from "vitest";
import "dotenv/config";

// Mock environment variables for testing
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = "test";

  // Mock JWT secret for testing
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "test-secret-key-for-testing-only";
  }

  // Mock OAuth server URL
  if (!process.env.OAUTH_SERVER_URL) {
    process.env.OAUTH_SERVER_URL = "http://localhost:3000";
  }

  // Use in-memory database for tests or mock database URL
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  }
});

// Clean up after each test
afterEach(() => {
  // Clear any test-specific mocks or state
});

afterAll(() => {
  // Global cleanup
});
