import { load } from "cheerio";
import type { CardStats } from "../types/player.types";

export class PlayerCardsParser {
  static parse(html: string): CardStats | null {
    const $ = load(html);
    const text = $.text();

    const levels: CardStats["levels"] = {
      16: 0,
      15: 0,
      14: 0,
      13: 0,
      12: 0,
      11: 0,
      10: 0,
      9: 0,
    };

    $('[class*="level"], [class*="lvl"]').each((_i, elem) => {
      const elemText = $(elem).text().trim();
      const levelMatch = elemText.match(/(?:Lvl|Level)\s*(\d{1,2})/i);
      if (levelMatch?.[1]) {
        const level = parseInt(levelMatch[1]);
        if (
          level >= 9 &&
          level <= 16 &&
          levels[level as keyof typeof levels] !== undefined
        ) {
          levels[level as keyof typeof levels]++;
        }
      }
    });

    // Fallback to text pattern matching if element parsing fails
    if (Object.values(levels).every((v) => v === 0)) {
      for (const level of [16, 15, 14, 13, 12, 11, 10, 9]) {
        const patterns = [
          `(?:Lvl|Level)\\s*${level}\\s+(\\d+)\\s+\\d+\\s+\\d+%`,
          `${level}\\s+(\\d+)\\s+\\d+\\s+\\d+%`,
        ];

        for (const pattern of patterns) {
          const match = text.match(new RegExp(pattern, "i"));
          if (match?.[1]) {
            const count = parseInt(match[1]);
            if (count > 0) {
              levels[level as keyof typeof levels] = count;
            }
            break;
          }
        }
      }
    }

    const total_14_plus =
      (levels[16] ?? 0) + (levels[15] ?? 0) + (levels[14] ?? 0);
    const total_15_plus = (levels[16] ?? 0) + (levels[15] ?? 0);

    return {
      levels,
      total_14_plus,
      total_15_plus,
    };
  }
}
