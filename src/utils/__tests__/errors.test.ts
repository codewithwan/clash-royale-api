import { describe, it, expect } from "bun:test";
import {
  PlayerNotFoundError,
  NetworkError,
  ParsingError,
  InvalidTagError,
  validateTag,
  createErrorResponse,
} from "../errors";

describe("Error Classes", () => {
  it("should create PlayerNotFoundError with correct properties", () => {
    const error = new PlayerNotFoundError("L2QV2J2RC");
    expect(error.code).toBe("PLAYER_NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Player with tag #L2QV2J2RC not found");
    expect(error.name).toBe("PlayerNotFoundError");
  });

  it("should create NetworkError with correct properties", () => {
    const error = new NetworkError("Connection failed");
    expect(error.code).toBe("NETWORK_ERROR");
    expect(error.statusCode).toBe(503);
    expect(error.message).toBe("Connection failed");
    expect(error.name).toBe("NetworkError");
  });

  it("should create ParsingError with correct properties", () => {
    const error = new ParsingError("Failed to parse data");
    expect(error.code).toBe("PARSING_ERROR");
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Failed to parse data");
    expect(error.name).toBe("ParsingError");
  });

  it("should create InvalidTagError with correct properties", () => {
    const error = new InvalidTagError("INVALID");
    expect(error.code).toBe("INVALID_TAG");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid player tag format: INVALID");
    expect(error.name).toBe("InvalidTagError");
  });
});

describe("validateTag", () => {
  it("should validate correct 8-character tag", () => {
    expect(validateTag("L2QV2J2R")).toBe(true);
    expect(validateTag("#L2QV2J2R")).toBe(true);
    expect(validateTag("l2qv2j2r")).toBe(true);
  });

  it("should validate correct 9-character tag", () => {
    expect(validateTag("L2QV2J2RC")).toBe(true);
    expect(validateTag("#L2QV2J2RC")).toBe(true);
  });

  it("should reject invalid tags", () => {
    expect(validateTag("ABC")).toBe(false);
    expect(validateTag("L2QV2J2RCC")).toBe(false);
    expect(validateTag("L2QV2J2")).toBe(false);
    expect(validateTag("L2QV-2J2")).toBe(false);
    expect(validateTag("")).toBe(false);
  });
});

describe("createErrorResponse", () => {
  it("should create error response from custom error", () => {
    const error = new PlayerNotFoundError("L2QV2J2RC");
    const response = createErrorResponse(error);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("PLAYER_NOT_FOUND");
    expect(response.body.error.message).toBe("Player with tag #L2QV2J2RC not found");
  });

  it("should create error response from generic error", () => {
    const error = new Error("Something went wrong");
    const response = createErrorResponse(error);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
    expect(response.body.error.message).toBe("Something went wrong");
  });

  it("should handle error without message", () => {
    const error = new Error();
    const response = createErrorResponse(error);

    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe("An unexpected error occurred");
  });
});

