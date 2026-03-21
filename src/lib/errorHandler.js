import { NextResponse } from "next/server";

/**
 * Wraps API handlers with consistent error handling to prevent crashes
 * @param {Function} handler - Async route handler (POST, GET, etc)
 * @returns {Function} Wrapped handler with error handling
 */
export function withErrorHandler(handler) {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error("API Error:", error);

      // Handle specific error types
      if (error.name === "ValidationError") {
        return NextResponse.json(
          { error: "Validation failed", details: error.message },
          { status: 400 }
        );
      }

      if (error.name === "MongoError" || error.code === 11000) {
        return NextResponse.json(
          { error: "Database error: Duplicate entry" },
          { status: 409 }
        );
      }

      if (error.message?.includes("MONGODB_URI")) {
        return NextResponse.json(
          { error: "Database connection error" },
          { status: 503 }
        );
      }

      // Generic error response
      return NextResponse.json(
        { error: "Internal server error", message: error.message },
        { status: 500 }
      );
    }
  };
}
