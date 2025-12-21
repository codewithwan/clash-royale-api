import { load } from "cheerio";
import type { PlayerCollections } from "../types/player.types";

export class PlayerCollectionsParser {
  /**
   * Extract cards from a specific section (cards are in next sibling after h3 header)
   */
  private static extractCardsFromSection(
    $: any,
    sectionTitle: string
  ): string[] {
    const cards: string[] = [];
    const headers = $("h3");
    let targetHeader: any = null;

    headers.each((_i: number, elem: any) => {
      const text = $(elem).text().trim();
      if (text.includes(sectionTitle)) {
        targetHeader = $(elem);
        return false;
      }
    });

    if (targetHeader) {
      let container = targetHeader.next();

      while (
        container.length > 0 &&
        container.find("div.player_card, div[class*='player_card']").length ===
          0
      ) {
        container = container.next();
        if (container.length === 0 || container.get(0)?.tagName === "H3") {
          break;
        }
      }

      if (container.length > 0) {
        container
          .find("div.player_card, div[class*='player_card']")
          .each((_i: number, card: any) => {
            const $card = $(card);
            const classes = $card.attr("class") || "";
            const img = $card.find("img");
            const imgClasses = img.attr("class") || "";

            // Skip locked/not found cards
            if (
              !classes.includes("grey") &&
              !imgClasses.includes("grey") &&
              !classes.includes("not_found")
            ) {
              const name =
                img.attr("alt") ||
                img.attr("title") ||
                $card.attr("data-content") ||
                "";
              if (name && name.trim() && !cards.includes(name)) {
                cards.push(name.trim());
              }
            }
          });
      }
    }

    return cards;
  }

  static parse(html: string): PlayerCollections {
    const $ = load(html);

    const towerCards = this.extractCardsFromSection($, "Tower Card Collection");
    const heroCards = this.extractCardsFromSection($, "Hero Card Collection");
    const evoCards = this.extractCardsFromSection($, "Evo Card Collection");

    return {
      tower: towerCards,
      hero: heroCards,
      evolution: evoCards,
    };
  }
}
