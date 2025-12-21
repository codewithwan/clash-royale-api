import { load } from "cheerio";
import type { PlayerBasicInfo } from "../types/player.types";

/**
 * Helper function to parse number from text using regex pattern
 */
function parseNumber(text: string, pattern: string): number | null {
  const match = text.match(new RegExp(pattern, "i"));
  if (match?.[1]) {
    try {
      return parseInt(match[1].replace(/,/g, ""));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Helper to extract number from element text
 */
function extractNumber(text: string): number | null {
  const cleaned = text.replace(/,/g, "").trim();
  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Parser for basic player information
 */
export class PlayerBasicParser {
  static parse(html: string, tag: string): PlayerBasicInfo | null {
    const $ = load(html);

    const data: PlayerBasicInfo = {
      tag: `#${tag.replace("#", "").toUpperCase()}`,
      clan: null,
    };

    // Name from title
    const title = $("title").text();
    const nameMatch = title.match(/(.+?)\s*#/);
    if (nameMatch?.[1]) {
      data.name = nameMatch[1].trim();
    }

    // Try to get stats from various possible selectors
    // Method 1: Look for stats in player stats section
    const statsItems = $(
      ".player_stat_value, .stats_item_value, [class*='stat']"
    );

    statsItems.each((_i: number, elem: any) => {
      const $elem = $(elem);
      const value = $elem.text().trim();
      const parent = $elem.parent();
      const label = parent
        .find(".player_stat_name, .stats_item_name, [class*='label']")
        .text()
        .toLowerCase();

      const numValue = extractNumber(value);

      if (label.includes("trophy") || label.includes("trophies")) {
        if (label.includes("best") || label.includes("personal")) {
          if (numValue) data.best_trophies = numValue;
        } else if (!data.trophies && numValue) {
          data.trophies = numValue;
        }
      }

      if (label.includes("arena") && numValue) {
        data.arena = numValue;
      }

      if (
        label.includes("level") &&
        numValue &&
        numValue >= 1 &&
        numValue <= 60
      ) {
        data.king_level = numValue;
      }
    });

    // Method 2: Use meta tags if available
    const metaTrophies = $('meta[property="og:description"]').attr("content");
    if (metaTrophies && !data.trophies) {
      const trophyMatch = metaTrophies.match(/(\d{1,5})\s*trophies/i);
      if (trophyMatch?.[1]) {
        data.trophies = parseInt(trophyMatch[1]);
      }
    }

    // Method 2.5: Extract trophies from trophy display (current/best format)
    // Look for pattern like "9679 / 10123" (current / best)
    const text = $.text();
    const trophyRangeMatch = text.match(/(\d{1,5})\s*\/\s*(\d{1,5})/);
    if (trophyRangeMatch?.[1] && trophyRangeMatch?.[2]) {
      const current = parseInt(trophyRangeMatch[1]);
      const best = parseInt(trophyRangeMatch[2]);
      if (!data.trophies && current > 0) data.trophies = current;
      if (!data.best_trophies && best >= current) data.best_trophies = best;
    }

    // Arena detection
    if (!data.arena) {
      if (
        text.includes("Legendary Arena") ||
        text.includes("Ultimate Champion")
      ) {
        data.arena = 23;
      } else if (text.includes("League")) {
        const leagueMatch = text.match(/League (\d+)/);
        if (leagueMatch?.[1]) {
          const league = parseInt(leagueMatch[1]);
          if (league >= 1 && league <= 10) {
            data.arena = 14 + league; // Leagues start at arena 14
          }
        }
      }
    }

    // Method 3: Fallback to text matching for missing fields

    // King Level (if not found)
    if (!data.king_level) {
      const levelPatterns = ["King.*?Level[:\\s]*(\\d+)", "Level (\\d+)"];
      for (const pattern of levelPatterns) {
        const level = parseNumber(text, pattern);
        if (level && level >= 1 && level <= 60) {
          data.king_level = level;
          break;
        }
      }
    }

    // Trophies (if not found)
    if (!data.trophies) {
      const trophyPatterns = [
        "(\\d{4,5})\\s*(?:Current )?[Tt]rophies",
        "Trophy.*?(\\d{4,5})",
        "(\\d{4,5})\\s*(?:\\/|,)",
      ];
      for (const pattern of trophyPatterns) {
        const trophies = parseNumber(text, pattern);
        if (trophies && trophies >= 0) {
          data.trophies = trophies;
          break;
        }
      }
    }

    // Best Trophies (if not found)
    if (!data.best_trophies) {
      const bestPatterns = [
        "Personal Best[:\\s]*(\\d{4,5})",
        "(?:Best|PB|Highest)[:\\s]*(\\d{4,5})",
      ];
      for (const pattern of bestPatterns) {
        const best = parseNumber(text, pattern);
        if (best && best >= (data.trophies || 0)) {
          data.best_trophies = best;
          break;
        }
      }
    }

    // Arena (if not found)
    if (!data.arena) {
      const arena = parseNumber(text, "Arena (\\d+)");
      if (arena) data.arena = arena;
    }

    // Clan - try multiple methods
    // Always set clan field (null if not in clan)
    data.clan = null;

    if (!text.includes("Not in Clan")) {
      const clanElement = $(".clan_name, [class*='clan']").first();
      if (clanElement.length > 0) {
        const clanName = clanElement.text().trim();
        if (
          clanName &&
          clanName.length > 2 &&
          !clanName.toLowerCase().includes("not in")
        ) {
          data.clan = clanName;
        }
      }

      if (!data.clan) {
        const clanMatch = text.match(
          /(?:Clan|Member of)[:\s]*([^\n]+?)(?:\n|Role|Donations)/
        );
        if (clanMatch?.[1]) {
          const clan = clanMatch[1].trim();
          if (clan.length > 2 && !clan.toLowerCase().includes("not in")) {
            data.clan = clan;
          }
        }
      }
    }

    // Achievements - extract unlocked badges
    const achievements: string[] = [];

    // Look for badge elements with badge-icon class
    $(".badge-icon, [class*='badge-icon']").each((_i: number, elem: any) => {
      const $elem = $(elem);
      const $parent = $elem.parent();

      // Check if badge is unlocked (data-hidden="False" on parent)
      const isHidden = $parent.attr("data-hidden");
      if (isHidden === "False") {
        // Extract badge name from class like "badge-ramp-up-2" or "badge-sudden-death-3"
        const classes = $elem.attr("class") || "";
        const badgeMatch = classes.match(/badge-([a-z0-9-]+?)(?:-\d+)?$/i);

        if (badgeMatch?.[1]) {
          const rawName = badgeMatch[1];

          // Skip if badge name is empty, just numbers, or too short
          if (!rawName || /^\d+$/.test(rawName) || rawName.length < 2) {
            return;
          }

          const badgeName = rawName
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          if (
            badgeName &&
            badgeName.trim().length > 1 &&
            !achievements.includes(badgeName)
          ) {
            achievements.push(badgeName);
          }
        }
      }
    });

    if (achievements.length > 0) {
      data.achievements = achievements.sort();
    }

    // Three crown wins
    const threeCrownMatch = text.match(
      /(\d{1,3}(?:,\d{3})*)\s*(?:three crown|3 crown)/i
    );
    if (threeCrownMatch?.[1]) {
      data.three_crown_wins = parseInt(threeCrownMatch[1].replace(/,/g, ""));
    }

    return data;
  }
}
