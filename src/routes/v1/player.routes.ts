import { Elysia } from "elysia";
import { PlayerController } from "../../controllers/player.controller";
import { createErrorResponse } from "../../utils/errors";
import {
  playerTagParam,
  playerTagParamSimple,
  getPlayerDataDocs,
  getPlayerCardsDocs,
  getPlayerCollectionsDocs,
} from "../../docs/player.docs";

export const playerRoutesV1 = new Elysia({ prefix: "/player" })
  .get(
    "/:tag",
    async ({ params: { tag }, set }) => {
      try {
        const result = await PlayerController.handleGetPlayerData(tag);
        set.status = result.status;
        return result.body;
      } catch (error) {
        const errorResponse = createErrorResponse(error as Error);
        set.status = errorResponse.status;
        return errorResponse.body;
      }
    },
    {
      detail: getPlayerDataDocs,
      params: playerTagParam,
    }
  )
  .get(
    "/:tag/cards",
    async ({ params: { tag }, set }) => {
      try {
        const result = await PlayerController.handleGetPlayerCards(tag);
        set.status = result.status;
        return result.body;
      } catch (error) {
        const errorResponse = createErrorResponse(error as Error);
        set.status = errorResponse.status;
        return errorResponse.body;
      }
    },
    {
      detail: getPlayerCardsDocs,
      params: playerTagParamSimple,
    }
  )
  .get(
    "/:tag/collections",
    async ({ params: { tag }, set }) => {
      try {
        const result = await PlayerController.handleGetPlayerCollections(tag);
        set.status = result.status;
        return result.body;
      } catch (error) {
        const errorResponse = createErrorResponse(error as Error);
        set.status = errorResponse.status;
        return errorResponse.body;
      }
    },
    {
      detail: getPlayerCollectionsDocs,
      params: playerTagParamSimple,
    }
  )
  .get(
    "/:tag/cards-by-level",
    async ({ params: { tag }, set }) => {
      try {
        const result = await PlayerController.handleGetPlayerCardsByLevel(tag);
        set.status = result.status;
        return result.body;
      } catch (error) {
        const errorResponse = createErrorResponse(error as Error);
        set.status = errorResponse.status;
        return errorResponse.body;
      }
    },
    {
      detail: {
        tags: ["Player"],
        summary: "Get player cards grouped by level",
        description: `Get all player's cards organized by their level (9-16).

Returns a list where each entry contains:
- Level number (16-9, sorted descending)
- Count of cards at that level
- Array of card names at that level (sorted alphabetically)

Useful for seeing exactly which cards a player has at each level.`,
        responses: {
          200: {
            description: "Success - Cards by level retrieved",
          },
          400: {
            description: "Bad Request - Invalid tag format",
          },
          404: {
            description: "Not Found - Player not found",
          },
          500: {
            description: "Internal Server Error",
          },
          503: {
            description: "Service Unavailable",
          },
        },
      },
      params: playerTagParamSimple,
    }
  );
