import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { apiV1 } from "./routes/v1";
import { createErrorResponse } from "./utils/errors";

const app = new Elysia()
  .use(cors())
  .onError(({ code, error, set }) => {
    if (error && typeof error === "object" && "code" in error) {
      const errorResponse = createErrorResponse(error as Error);
      set.status = errorResponse.status;
      return errorResponse.body;
    }

    set.status = 500;
    return {
      success: false,
      error: {
        code: code || "INTERNAL_ERROR",
        message: error?.message || "An unexpected error occurred",
      },
    };
  })
  .use(
    swagger({
      path: "/api-docs",
      documentation: {
        info: {
          title: "Royale API Free",
          version: "1.0.0",
          description:
            "Free, open-source Clash Royale API - No authentication required. Use /api/v1 for the latest stable version.",
        },
        tags: [
          { name: "Player", description: "Player endpoints" },
          { name: "Health", description: "Health check endpoints" },
        ],
      },
    })
  )
  .get("/", ({ set }) => {
    set.status = 302;
    set.headers["Location"] = "/api-docs";
  })
  .get(
    "/health",
    () => ({
      success: true,
      data: {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    }),
    {
      detail: {
        tags: ["Health"],
        summary: "Health check",
        description: "Check API health status",
      },
    }
  )
  .use(apiV1)
  .listen(process.env.PORT || 3000);

console.log(
  `🚀 Royale API Free running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log(
  `📖 API Docs available at http://${app.server?.hostname}:${app.server?.port}/api-docs`
);
console.log(
  `✨ V1 API: http://${app.server?.hostname}:${app.server?.port}/api/v1`
);
