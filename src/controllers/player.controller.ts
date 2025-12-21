import { RoyaleAPIService } from "../services/royaleapi.service";
import {
  PlayerBasicParser,
  PlayerCardsParser,
  PlayerCollectionsParser,
  PlayerBattlesParser,
} from "../parsers";
import { PlayerCardsByLevelParser } from "../parsers/player-cards-by-level.parser";
import type {
  PlayerData,
  PlayerBasicInfo,
  CardStats,
} from "../types/player.types";
import type { BattleHistory } from "../types/battle.types";
import {
  PlayerNotFoundError,
  ParsingError,
  NetworkError,
  InvalidTagError,
  validateTag,
  createErrorResponse,
} from "../utils/errors";

export class PlayerController {
  /**
   * Get complete player data
   */
  static async getPlayerData(tag: string): Promise<PlayerData> {
    if (!validateTag(tag)) {
      throw new InvalidTagError(tag);
    }

    try {
      const [profileHTML, cardsHTML] = await Promise.all([
        RoyaleAPIService.fetchPlayerPage(tag),
        RoyaleAPIService.fetchPlayerCardsPage(tag),
      ]);

      const basicInfo = PlayerBasicParser.parse(profileHTML, tag);
      if (!basicInfo) {
        throw new ParsingError("Failed to parse player basic information");
      }

      const cardStats = cardsHTML ? PlayerCardsParser.parse(cardsHTML) : null;
      const collections = PlayerCollectionsParser.parse(profileHTML);

      const totalTowers = collections.tower.length;
      const totalHeroes = collections.hero.length;
      const totalEvos = collections.evolution.length;

      return {
        ...basicInfo,
        cards: cardStats
          ? {
              ...cardStats,
              by_rarity: {
                champion: totalHeroes,
                evolution: totalEvos,
              },
            }
          : null,
        towers: {
          count: totalTowers,
          cards: collections.tower,
        },
        heroes: {
          count: totalHeroes,
          cards: collections.hero,
        },
        evolutions: {
          count: totalEvos,
          cards: collections.evolution,
        },
      };
    } catch (error) {
      if (
        error instanceof PlayerNotFoundError ||
        error instanceof NetworkError ||
        error instanceof ParsingError ||
        error instanceof InvalidTagError
      ) {
        throw error;
      }

      throw new ParsingError(
        `Failed to process player data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get only card statistics
   */
  static async getPlayerCards(tag: string): Promise<CardStats> {
    if (!validateTag(tag)) {
      throw new InvalidTagError(tag);
    }

    try {
      const html = await RoyaleAPIService.fetchPlayerCardsPage(tag);
      if (!html) {
        throw new PlayerNotFoundError(tag);
      }

      const cardStats = PlayerCardsParser.parse(html);
      if (!cardStats) {
        throw new ParsingError("Failed to parse card statistics");
      }

      return cardStats;
    } catch (error) {
      if (
        error instanceof PlayerNotFoundError ||
        error instanceof NetworkError ||
        error instanceof ParsingError ||
        error instanceof InvalidTagError
      ) {
        throw error;
      }

      throw new ParsingError(
        `Failed to process card data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get only basic player info
   */
  static async getPlayerBasicInfo(tag: string): Promise<PlayerBasicInfo> {
    if (!validateTag(tag)) {
      throw new InvalidTagError(tag);
    }

    try {
      const html = await RoyaleAPIService.fetchPlayerPage(tag);
      const basicInfo = PlayerBasicParser.parse(html, tag);

      if (!basicInfo) {
        throw new ParsingError("Failed to parse player basic information");
      }

      return basicInfo;
    } catch (error) {
      if (
        error instanceof PlayerNotFoundError ||
        error instanceof NetworkError ||
        error instanceof ParsingError ||
        error instanceof InvalidTagError
      ) {
        throw error;
      }

      throw new ParsingError(
        `Failed to process player basic info: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get only card collections
   */
  static async getPlayerCollections(tag: string) {
    if (!validateTag(tag)) {
      throw new InvalidTagError(tag);
    }

    try {
      const html = await RoyaleAPIService.fetchPlayerPage(tag);
      const collections = PlayerCollectionsParser.parse(html);

      return collections;
    } catch (error) {
      if (
        error instanceof PlayerNotFoundError ||
        error instanceof NetworkError ||
        error instanceof ParsingError ||
        error instanceof InvalidTagError
      ) {
        throw error;
      }

      throw new ParsingError(
        `Failed to process collections: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Handle GET /api/v1/player/:tag - Complete player data
   */
  static async handleGetPlayerData(tag: string) {
    try {
      const data = await this.getPlayerData(tag);

      return {
        status: 200,
        body: {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            cached: false,
            source: "royaleapi.com",
            version: "v1",
          },
        },
      };
    } catch (error) {
      return createErrorResponse(error as Error);
    }
  }

  /**
   * Handle GET /api/v1/player/:tag/cards - Card statistics only
   */
  static async handleGetPlayerCards(tag: string) {
    try {
      const data = await this.getPlayerCards(tag);

      return {
        status: 200,
        body: {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            cached: false,
            source: "royaleapi.com",
            version: "v1",
          },
        },
      };
    } catch (error) {
      return createErrorResponse(error as Error);
    }
  }

  /**
   * Handle GET /api/v1/player/:tag/collections - Card collections
   */
  static async handleGetPlayerCollections(tag: string) {
    try {
      const collectionsData = await this.getPlayerCollections(tag);

      return {
        status: 200,
        body: {
          success: true,
          data: {
            tower: {
              count: collectionsData.tower.length,
              cards: collectionsData.tower,
            },
            hero: {
              count: collectionsData.hero.length,
              cards: collectionsData.hero,
            },
            evolution: {
              count: collectionsData.evolution.length,
              cards: collectionsData.evolution,
            },
          },
          meta: {
            timestamp: new Date().toISOString(),
            cached: false,
            source: "royaleapi.com",
            version: "v1",
          },
        },
      };
    } catch (error) {
      return createErrorResponse(error as Error);
    }
  }

  /**
   * Handle GET /api/v1/player/:tag/cards-by-level - Cards grouped by level
   */
  static async handleGetPlayerCardsByLevel(tag: string) {
    if (!validateTag(tag)) {
      throw new InvalidTagError(tag);
    }

    try {
      const html = await RoyaleAPIService.fetchPlayerCardsPage(tag);
      if (!html) {
        throw new PlayerNotFoundError(tag);
      }

      const cardsByLevel = PlayerCardsByLevelParser.parse(html);

      return {
        status: 200,
        body: {
          success: true,
          data: cardsByLevel,
          meta: {
            timestamp: new Date().toISOString(),
            cached: false,
            source: "royaleapi.com",
            version: "v1",
          },
        },
      };
    } catch (error) {
      return createErrorResponse(error as Error);
    }
  }

  /**
   * Handle GET /api/v1/player/:tag/battles - Battle history
   */
  static async handleGetPlayerBattles(tag: string) {
    if (!validateTag(tag)) {
      throw new InvalidTagError(tag);
    }

    try {
      const html = await RoyaleAPIService.fetchPlayerBattlesPage(tag);
      const battleHistory = PlayerBattlesParser.parse(html, tag);

      return {
        status: 200,
        body: {
          success: true,
          data: battleHistory,
          meta: {
            timestamp: new Date().toISOString(),
            cached: false,
            source: "royaleapi.com",
            version: "v1",
          },
        },
      };
    } catch (error) {
      return createErrorResponse(error as Error);
    }
  }
}
