import { load } from "cheerio";

export interface CardByLevel {
  level: number;
  count: number;
  cards: string[];
}

/**
 * Parser to extract cards grouped by level
 */
export class PlayerCardsByLevelParser {
  static parse(html: string): CardByLevel[] {
    const $ = load(html);
    const cardsByLevel: Map<number, string[]> = new Map();

    // Initialize levels 9-16
    for (let i = 9; i <= 16; i++) {
      cardsByLevel.set(i, []);
    }

    // Find all card elements with level information
    $('[class*="card"], [class*="player_card"]').each(
      (_i: number, elem: any) => {
        const $elem = $(elem);

        // Try to find level from various possible locations
        let level: number | null = null;
        let cardName: string | null = null;

        // Method 1: Look for level in the card element itself
        const levelText = $elem
          .find('[class*="level"], [class*="lvl"]')
          .first()
          .text();
        const levelMatch = levelText.match(/(?:Lvl|Level)?\s*(\d{1,2})/i);
        if (levelMatch?.[1]) {
          level = parseInt(levelMatch[1]);
        }

        // Method 2: Look in parent or siblings
        if (!level) {
          const parentText = $elem.parent().text();
          const parentMatch = parentText.match(/(?:Lvl|Level)\s*(\d{1,2})/i);
          if (parentMatch?.[1]) {
            level = parseInt(parentMatch[1]);
          }
        }

        // Get card name from image alt or title
        const img = $elem.find("img").first();
        cardName =
          img.attr("alt") ||
          img.attr("title") ||
          $elem.attr("data-content") ||
          "";

        // Add to map if valid
        if (level && level >= 9 && level <= 16 && cardName && cardName.trim()) {
          const cards = cardsByLevel.get(level) || [];
          const trimmedName = cardName.trim();
          if (!cards.includes(trimmedName)) {
            cards.push(trimmedName);
            cardsByLevel.set(level, cards);
          }
        }
      }
    );

    // Convert map to array and sort by level (descending)
    const result: CardByLevel[] = [];
    for (let level = 16; level >= 9; level--) {
      const cards = cardsByLevel.get(level) || [];
      if (cards.length > 0) {
        result.push({
          level,
          count: cards.length,
          cards: cards.sort(),
        });
      }
    }

    return result;
  }
}
