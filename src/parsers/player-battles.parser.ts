import { load } from "cheerio";
import type {
  Battle,
  BattleHistory,
  BattleResult,
  BattleMode,
  BattleCard,
  BattleParticipant,
} from "../types/battle.types";

/**
 * Helper to determine battle result from text
 */
function parseBattleResult(text: string): BattleResult {
  const lower = text.toLowerCase().trim();
  if (lower.includes("victory") || lower.includes("win")) return "Victory";
  if (lower.includes("defeat") || lower.includes("loss")) return "Defeat";
  if (lower.includes("draw")) return "Draw";
  return "Victory"; // Default fallback
}

/**
 * Helper to parse battle mode
 */
function parseBattleMode(text: string): BattleMode {
  const lower = text.toLowerCase().trim();
  if (lower.includes("ladder")) return "Ladder";
  if (lower.includes("path of legend")) return "Path of Legend";
  if (lower.includes("trophy road")) return "Trophy Road";
  if (lower.includes("2v2")) return "2v2";
  if (lower.includes("challenge")) return "Challenge";
  if (lower.includes("tournament")) return "Tournament";
  if (lower.includes("friendly")) return "Friendly";
  if (lower.includes("special") || lower.includes("event"))
    return "Special Event";
  return "Unknown";
}

/**
 * Helper to extract number from text
 */
function extractNumber(text: string): number | undefined {
  const cleaned = text.replace(/[,\s]/g, "").trim();
  const num = parseInt(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Helper to parse trophy change (e.g., "+30", "-28")
 */
function parseTrophyChange(text: string): number | undefined {
  const match = text.match(/([+-]\d+)/);
  if (match?.[1]) {
    return parseInt(match[1]);
  }
  return undefined;
}

/**
 * Parser for player battle history
 */
export class PlayerBattlesParser {
  /**
   * Parse battle history HTML
   */
  static parse(html: string, tag: string): BattleHistory {
    const $ = load(html);

    const battles: Battle[] = [];
    const cleanTag = `#${tag.replace("#", "").toUpperCase()}`;

    // Find all battle containers using actual RoyaleAPI class names
    const battleContainers = $(
      ".battle_list_battle, .ui.attached.segment.battle"
    );

    battleContainers.each((_i: number, container: any) => {
      try {
        const $container = $(container);

        // Extract battle result from ribbon label
        const $ribbon = $container.find(
          ".ui.left.ribbon.label, .ui.right.ribbon.label"
        );
        const ribbonText = $ribbon.text().trim();
        const hasBlueRibbon = $ribbon.hasClass("blue");
        const hasRedRibbon = $ribbon.hasClass("red");

        let result: BattleResult = "Victory";
        if (ribbonText.toLowerCase().includes("defeat") || hasRedRibbon) {
          result = "Defeat";
        } else if (ribbonText.toLowerCase().includes("draw")) {
          result = "Draw";
        } else if (
          ribbonText.toLowerCase().includes("victory") ||
          hasBlueRibbon
        ) {
          result = "Victory";
        }

        // Extract battle mode from header
        const modeText = $container
          .find(".game_mode_header, h4.ui.header")
          .first()
          .text()
          .trim();
        const mode = parseBattleMode(modeText || "Ladder");

        // Extract time ago from timestamp
        const timeText = $container
          .find(".battle-timestamp-popup, .i18n_duration_short")
          .text()
          .trim();

        // Extract crown score from result header
        const resultHeader = $container.find(".result_header").text();
        const scoreMatch = resultHeader.match(/(\d+)\s*[-–—]\s*(\d+)/);
        const playerCrowns = scoreMatch?.[1] ? parseInt(scoreMatch[1]) : 0;
        const opponentCrowns = scoreMatch?.[2] ? parseInt(scoreMatch[2]) : 0;

        // Find player sections (team segments)
        const teamSegments = $container.find(
          ".team-segment, .ui.basic.segment.team-segment"
        );

        let player: BattleParticipant = { crowns: playerCrowns, deck: [] };
        let opponent: BattleParticipant = { crowns: opponentCrowns, deck: [] };

        // Parse each team segment
        teamSegments.each((idx: number, section: any) => {
          const $section = $(section);
          const isPlayer = idx === 0; // First segment is usually the player

          // Extract player name
          const name = $section
            .find(".player_name_header, a.player_name_header")
            .first()
            .text()
            .trim();

          // Extract clan
          const clanElem = $section
            .find(".battle_player_clan, a.battle_player_clan")
            .first();
          const clan = clanElem.length > 0 ? clanElem.text().trim() : undefined;

          // Extract trophies and trophy change
          const trophyContainer = $section.find(".trophy_container");
          const trophyLabel = trophyContainer.find(".ui.label").first().text();
          const trophies = extractNumber(trophyLabel);

          const trophyChangeLabel = trophyContainer
            .find(".ui.basic.label, .ui.basic.blue.label, .ui.basic.red.label")
            .text();
          const trophyChange = parseTrophyChange(trophyChangeLabel || "");

          // Extract deck cards
          const deck: BattleCard[] = [];
          const cardImages = $section.find(".deck_card, img.deck_card");

          cardImages.each((_cardIdx: number, cardImg: any) => {
            const $cardImg = $(cardImg);
            const dataKey = $cardImg.attr("data-card-key") || "";

            if (dataKey) {
              // Check if evolution
              const isEvolution = dataKey.includes("-ev");

              // Extract card name
              let cardName = dataKey
                .replace(/-ev\d+$/, "") // Remove evolution suffix
                .replace(/-/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              // Extract level from nearby element
              // Use specific container class to avoid matching the image itself
              let levelElem = $cardImg
                .closest(".deck_card__four_wide")
                .find(".card-level, .ui.basic.center.card-level");

              if (levelElem.length === 0) {
                // Try finding in parent direct
                levelElem = $cardImg
                  .parent()
                  .find(".card-level, .ui.basic.center.card-level");
              }

              const levelText = levelElem.text();
              const levelMatch = levelText.match(/(?:lvl|level)\s*(\d+)/i);
              const level = levelMatch?.[1] ? parseInt(levelMatch[1]) : 14;

              deck.push({
                name: cardName,
                level,
                is_evolution: isEvolution,
              });
            }
          });

          // Extract tower info
          const towerElem = $section.find(
            ".deck_tower_card__container, .deck_tower_card"
          );
          const towerLevelElem = towerElem.find(
            ".card-level, .ui.basic.center.card-level"
          );
          const towerLevelText = towerLevelElem.text();
          const towerLevelMatch = towerLevelText.match(
            /(?:level|lvl)\s*(\d+)/i
          );
          const towerLevel = towerLevelMatch?.[1]
            ? parseInt(towerLevelMatch[1])
            : undefined;

          // Extract avg elixir and cycle from stats menu
          const statsMenu = $section.find(".battle_stats.menu, .battle_stats");
          const avgElixirText = statsMenu
            .find(".item:contains('Avg Elixir')")
            .text();
          const avgElixirMatch = avgElixirText.match(/([\d.]+)/);
          const avgElixir = avgElixirMatch?.[1]
            ? parseFloat(avgElixirMatch[1])
            : undefined;

          const cycleText = statsMenu
            .find(".item:contains('4-Card Cycle')")
            .text();
          const cycleMatch = cycleText.match(/([\d.]+)/);
          const cycleCost = cycleMatch?.[1]
            ? parseFloat(cycleMatch[1])
            : undefined;

          const participant: BattleParticipant = {
            name: name || undefined,
            clan: clan || undefined,
            trophies,
            trophy_change: trophyChange,
            crowns: isPlayer ? playerCrowns : opponentCrowns,
            deck,
            tower: towerLevel ? { level: towerLevel } : undefined,
            avg_elixir: avgElixir && !isNaN(avgElixir) ? avgElixir : undefined,
            cycle_cost: cycleCost && !isNaN(cycleCost) ? cycleCost : undefined,
          };

          if (isPlayer) {
            player = participant;
          } else {
            opponent = participant;
          }
        });

        // Only add battle if we have valid data
        if (player.deck.length > 0 || opponent.deck.length > 0) {
          battles.push({
            result,
            mode,
            time_ago: timeText || undefined,
            player,
            opponent,
          });
        }
      } catch (error) {
        // Skip problematic battles
        console.error("Error parsing battle:", error);
      }
    });

    return {
      tag: cleanTag,
      total_battles: battles.length,
      battles,
    };
  }
}
