import { fetch } from "undici";
import { getHeaders } from "../utils/headers";
import { NetworkError, PlayerNotFoundError } from "../utils/errors";

const BASE_URL = "https://royaleapi.com";

export class RoyaleAPIService {
  /**
   * Fetch player profile page
   */
  static async fetchPlayerPage(tag: string): Promise<string> {
    const cleanTag = tag.replace("#", "").toUpperCase();
    const url = `${BASE_URL}/player/${cleanTag}`;

    try {
      const response = await fetch(url, {
        headers: getHeaders(),
        redirect: "follow",
      });

      if (response.status === 404) {
        throw new PlayerNotFoundError(tag);
      }

      if (!response.ok) {
        throw new NetworkError(
          `Failed to fetch player page: ${response.status} ${response.statusText}`
        );
      }

      return await response.text();
    } catch (error) {
      if (
        error instanceof PlayerNotFoundError ||
        error instanceof NetworkError
      ) {
        throw error;
      }

      // Handle network/connection errors
      if (error instanceof Error) {
        if (
          error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("ETIMEDOUT")
        ) {
          throw new NetworkError(
            `Network error while fetching player data: ${error.message}`
          );
        }
      }

      throw new NetworkError("Failed to fetch player data from source");
    }
  }

  /**
   * Fetch player cards page (optional endpoint)
   */
  static async fetchPlayerCardsPage(tag: string): Promise<string | null> {
    const cleanTag = tag.replace("#", "").toUpperCase();
    const url = `${BASE_URL}/player/${cleanTag}/cards/levels`;

    try {
      const response = await fetch(url, {
        headers: getHeaders(),
        redirect: "follow",
      });

      if (response.status === 404 || !response.ok) {
        return null;
      }

      return await response.text();
    } catch (error) {
      console.error("Fetch cards page error:", error);
      return null;
    }
  }
}
