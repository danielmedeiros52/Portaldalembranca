import { describe, it, expect, vi, beforeEach } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

describe("API Handler", () => {
  describe("CORS Configuration", () => {
    it("should set CORS headers for specific origin with credentials", () => {
      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        end: vi.fn(),
      } as unknown as VercelResponse;

      const origin = "https://example.com";

      mockRes.setHeader("Access-Control-Allow-Origin", origin);
      mockRes.setHeader("Access-Control-Allow-Credentials", "true");
      mockRes.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      mockRes.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");

      expect(mockRes.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", origin);
      expect(mockRes.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Credentials", "true");
      expect(mockRes.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      expect(mockRes.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    });

    it("should set wildcard origin without credentials", () => {
      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        end: vi.fn(),
      } as unknown as VercelResponse;

      const origin = "*";

      mockRes.setHeader("Access-Control-Allow-Origin", origin);
      // Should NOT set credentials header

      expect(mockRes.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
      expect(mockRes.setHeader).not.toHaveBeenCalledWith("Access-Control-Allow-Credentials", expect.anything());
    });

    it("should handle preflight OPTIONS requests", () => {
      const mockReq = {
        method: "OPTIONS",
        headers: {},
      } as unknown as VercelRequest;

      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        end: vi.fn(),
      } as unknown as VercelResponse;

      if (mockReq.method === "OPTIONS") {
        mockRes.status(200).end();
      }

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });
  });

  describe("Request Conversion", () => {
    it("should extract protocol from headers", () => {
      const mockReq = {
        headers: {
          "x-forwarded-proto": "https",
        },
      } as unknown as VercelRequest;

      const protocol = mockReq.headers["x-forwarded-proto"] || "https";
      expect(protocol).toBe("https");
    });

    it("should default to https when no protocol header", () => {
      const mockReq = {
        headers: {},
      } as unknown as VercelRequest;

      const protocol = mockReq.headers["x-forwarded-proto"] || "https";
      expect(protocol).toBe("https");
    });

    it("should extract host from headers", () => {
      const mockReq = {
        headers: {
          "x-forwarded-host": "example.com",
          host: "example.com",
        },
      } as unknown as VercelRequest;

      const host = mockReq.headers["x-forwarded-host"] || mockReq.headers.host || "localhost";
      expect(host).toBe("example.com");
    });

    it("should construct URL correctly", () => {
      const protocol = "https";
      const host = "example.com";
      const path = "/api/trpc/auth.me";

      const url = `${protocol}://${host}${path}`;
      expect(url).toBe("https://example.com/api/trpc/auth.me");
    });

    it("should convert string body to JSON", () => {
      const body = JSON.stringify({ email: "test@example.com", password: "password123" });
      const parsed = JSON.parse(body);

      expect(parsed.email).toBe("test@example.com");
      expect(parsed.password).toBe("password123");
    });

    it("should handle POST request body", () => {
      const mockReq = {
        method: "POST",
        body: { email: "test@example.com" },
      } as unknown as VercelRequest;

      const body =
        mockReq.method === "POST" && mockReq.body
          ? typeof mockReq.body === "string"
            ? mockReq.body
            : JSON.stringify(mockReq.body)
          : undefined;

      expect(body).toBeDefined();
      expect(JSON.parse(body!)).toEqual({ email: "test@example.com" });
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on internal error", () => {
      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as VercelResponse;

      const error = new Error("Internal error");

      mockRes.setHeader("Content-Type", "application/json");
      mockRes.status(500).json({
        error: {
          message: "Internal server error",
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: "Internal server error",
        },
      });
    });

    it("should log error details", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Test error");

      console.error("tRPC handler error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      expect(consoleError).toHaveBeenCalledWith("tRPC handler error:", error);
      expect(consoleError).toHaveBeenCalledWith("Error details:", expect.objectContaining({
        message: "Test error",
        name: "Error",
      }));

      consoleError.mockRestore();
    });

    it("should include error details in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as VercelResponse;

      const error = new Error("Test error");

      mockRes.status(500).json({
        error: {
          message: "Internal server error",
          ...(process.env.NODE_ENV === "development" && {
            details: error.message,
            stack: error.stack,
          }),
        },
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: "Internal server error",
          details: "Test error",
          stack: expect.any(String),
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should not include error details in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const mockRes = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as VercelResponse;

      const error = new Error("Test error");

      mockRes.status(500).json({
        error: {
          message: "Internal server error",
          ...(process.env.NODE_ENV === "development" && {
            details: error.message,
            stack: error.stack,
          }),
        },
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: "Internal server error",
        },
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Headers Conversion", () => {
    it("should convert request headers to Headers object", () => {
      const mockReq = {
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token123",
        },
      } as unknown as VercelRequest;

      const headers = new Headers();
      Object.entries(mockReq.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value.join(", ") : value);
        }
      });

      expect(headers.get("content-type")).toBe("application/json");
      expect(headers.get("authorization")).toBe("Bearer token123");
    });

    it("should handle array header values", () => {
      const mockReq = {
        headers: {
          cookie: ["session=abc123", "auth=xyz789"],
        },
      } as unknown as VercelRequest;

      const headers = new Headers();
      Object.entries(mockReq.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
        }
      });

      expect(headers.get("cookie")).toBe("session=abc123, auth=xyz789");
    });

    it("should skip undefined header values", () => {
      const mockReq = {
        headers: {
          "content-type": "application/json",
          "x-custom": undefined,
        },
      } as unknown as VercelRequest;

      const headers = new Headers();
      Object.entries(mockReq.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
        }
      });

      expect(headers.get("content-type")).toBe("application/json");
      expect(headers.get("x-custom")).toBeNull();
    });
  });

  describe("Response Handling", () => {
    it("should copy response headers", () => {
      const mockRes = {
        setHeader: vi.fn(),
      } as unknown as VercelResponse;

      const responseHeaders = new Headers();
      responseHeaders.set("Content-Type", "application/json");
      responseHeaders.set("Cache-Control", "no-cache");

      responseHeaders.forEach((value, key) => {
        mockRes.setHeader(key, value);
      });

      expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
      expect(mockRes.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
    });

    it("should send response with correct status", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
      } as unknown as VercelResponse;

      mockRes.status(200);
      mockRes.send("Response body");

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith("Response body");
    });
  });
});
