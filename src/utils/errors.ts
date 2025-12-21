export class PlayerNotFoundError extends Error {
  code = "PLAYER_NOT_FOUND";
  statusCode = 404;

  constructor(tag: string) {
    super(`Player with tag #${tag} not found`);
    this.name = "PlayerNotFoundError";
  }
}

export class NetworkError extends Error {
  code = "NETWORK_ERROR";
  statusCode = 503;

  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ParsingError extends Error {
  code = "PARSING_ERROR";
  statusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = "ParsingError";
  }
}

export class InvalidTagError extends Error {
  code = "INVALID_TAG";
  statusCode = 400;

  constructor(tag: string) {
    super(`Invalid player tag format: ${tag}`);
    this.name = "InvalidTagError";
  }
}

export function validateTag(tag: string): boolean {
  const cleanTag = tag.replace("#", "").toUpperCase();
  return /^[A-Z0-9]{8,9}$/.test(cleanTag);
}

export function createErrorResponse(
  error: Error & { code?: string; statusCode?: number }
) {
  const statusCode = (error as any).statusCode || 500;
  const code = (error as any).code || "INTERNAL_ERROR";

  return {
    status: statusCode,
    body: {
      success: false,
      error: {
        code,
        message: error.message || "An unexpected error occurred",
      },
    },
  };
}

