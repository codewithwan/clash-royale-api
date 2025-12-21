import { Elysia } from "elysia";
import { PlayerController } from "../../controllers/player.controller";
import { createErrorResponse } from "../../utils/errors";
import {
  playerTagParam,
  playerTagParamSimple,
  getPlayerDataDocs,
  getPlayerCardsDocs,
  getPlayerCollectionsDocs,
  getPlayerCardsByLevelDocs,
  getPlayerBattlesDocs,
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
      detail: getPlayerCardsByLevelDocs,
      params: playerTagParamSimple,
    }
  )
  .get(
    "/:tag/battles",
    async ({ params: { tag }, set }) => {
      try {
        const result = await PlayerController.handleGetPlayerBattles(tag);
        set.status = result.status;
        return result.body;
      } catch (error) {
        const errorResponse = createErrorResponse(error as Error);
        set.status = errorResponse.status;
        return errorResponse.body;
      }
    },
    {
      detail: getPlayerBattlesDocs,
      params: playerTagParamSimple,
    }
  );
