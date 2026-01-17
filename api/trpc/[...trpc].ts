// Handler for Vercel Serverless Functions
async function handler(req: any, res: any) {
  try {
    console.log("[tRPC] Handler invoked:", req.method, req.url);

    // Require statements for CommonJS compatibility
    console.log("[tRPC] Loading modules...");
    const { fetchRequestHandler } = require("@trpc/server/adapters/fetch");
    const { appRouter } = require("../../server/routers");
    const { sdk } = require("../../server/_core/sdk");
    console.log("[tRPC] Modules loaded successfully");

    // Enable CORS with proper credentials handling
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, "") || "*";

    // Only allow credentials if origin is not wildcard
    if (origin !== "*") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      console.log("[tRPC] Handling OPTIONS request");
      res.status(200).end();
      return;
    }

    // Convert VercelRequest to standard Request
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = `${protocol}://${host}${req.url}`;

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    });

    // Get body for POST requests
    let body: string | undefined;
    if (req.method === "POST" && req.body) {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const request = new Request(url, {
      method: req.method || "GET",
      headers,
      body: req.method === "POST" ? body : undefined,
    });

    console.log("[tRPC] Processing tRPC request...");
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: async () => {
        console.log("[tRPC] Creating context...");
        // Properly authenticate using SDK
        let user = null;
        try {
          user = await sdk.authenticateRequest(req as any);
          console.log("[tRPC] User authenticated:", user?.openId || "none");
        } catch (error) {
          // Authentication is optional for public procedures
          console.log("[tRPC] Authentication skipped:", error instanceof Error ? error.message : "unknown");
          user = null;
        }

        return {
          req: req as any,
          res: res as any,
          user,
        };
      },
    });

    console.log("[tRPC] Response status:", response.status);

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send response
    res.status(response.status);
    const responseBody = await response.text();
    res.send(responseBody);

    console.log("[tRPC] Request completed successfully");
  } catch (error) {
    console.error("[tRPC] Top-level error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("[tRPC] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    // Send proper JSON error response
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({
      error: {
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
    });
  }
}

// CommonJS export
module.exports = handler;
