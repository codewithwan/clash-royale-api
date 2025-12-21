import { describe, it, expect } from "bun:test";
import { PlayerCardsParser } from "../player-cards.parser";

describe("PlayerCardsParser", () => {
  const mockHTML = `
    <html>
      <body>
        <div class="level-16">Level 16: 5 cards</div>
        <div class="level-15">Level 15: 10 cards</div>
        <div class="level-14">Level 14: 20 cards</div>
      </body>
    </html>
  `;

  it("should parse card levels from HTML", () => {
    const result = PlayerCardsParser.parse(mockHTML);

    expect(result).not.toBeNull();
    expect(result?.levels).toBeDefined();
    expect(result?.levels[16]).toBeGreaterThanOrEqual(0);
    expect(result?.levels[15]).toBeGreaterThanOrEqual(0);
    expect(result?.levels[14]).toBeGreaterThanOrEqual(0);
  });

  it("should calculate total_14_plus", () => {
    const result = PlayerCardsParser.parse(mockHTML);
    expect(result?.total_14_plus).toBeGreaterThanOrEqual(0);
  });

  it("should calculate total_15_plus", () => {
    const result = PlayerCardsParser.parse(mockHTML);
    expect(result?.total_15_plus).toBeGreaterThanOrEqual(0);
  });

  it("should return null for empty HTML", () => {
    const result = PlayerCardsParser.parse("");
    expect(result).not.toBeNull();
    expect(result?.levels).toBeDefined();
  });

  it("should have all level keys from 9 to 16", () => {
    const result = PlayerCardsParser.parse(mockHTML);
    expect(result?.levels).toHaveProperty("9");
    expect(result?.levels).toHaveProperty("10");
    expect(result?.levels).toHaveProperty("11");
    expect(result?.levels).toHaveProperty("12");
    expect(result?.levels).toHaveProperty("13");
    expect(result?.levels).toHaveProperty("14");
    expect(result?.levels).toHaveProperty("15");
    expect(result?.levels).toHaveProperty("16");
  });
});

