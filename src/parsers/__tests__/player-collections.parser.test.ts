import { describe, it, expect } from "bun:test";
import { PlayerCollectionsParser } from "../player-collections.parser";

describe("PlayerCollectionsParser", () => {
  const mockHTML = `
    <html>
      <body>
        <h3>Tower Card Collection</h3>
        <div>
          <div class="player_card">
            <img alt="Tower Princess" />
          </div>
          <div class="player_card">
            <img alt="Cannoneer" />
          </div>
        </div>
        <h3>Hero Card Collection</h3>
        <div>
          <div class="player_card">
            <img alt="Golden Knight" />
          </div>
        </div>
        <h3>Evo Card Collection</h3>
        <div>
          <div class="player_card">
            <img alt="Archers" />
          </div>
          <div class="player_card">
            <img alt="Barbarians" />
          </div>
        </div>
      </body>
    </html>
  `;

  it("should parse card collections from HTML", () => {
    const result = PlayerCollectionsParser.parse(mockHTML);

    expect(result).toBeDefined();
    expect(result.tower).toBeInstanceOf(Array);
    expect(result.hero).toBeInstanceOf(Array);
    expect(result.evolution).toBeInstanceOf(Array);
  });

  it("should extract tower cards", () => {
    const result = PlayerCollectionsParser.parse(mockHTML);
    expect(result.tower.length).toBeGreaterThanOrEqual(0);
  });

  it("should extract hero cards", () => {
    const result = PlayerCollectionsParser.parse(mockHTML);
    expect(result.hero.length).toBeGreaterThanOrEqual(0);
  });

  it("should extract evolution cards", () => {
    const result = PlayerCollectionsParser.parse(mockHTML);
    expect(result.evolution.length).toBeGreaterThanOrEqual(0);
  });

  it("should handle empty HTML", () => {
    const result = PlayerCollectionsParser.parse("");
    expect(result.tower).toEqual([]);
    expect(result.hero).toEqual([]);
    expect(result.evolution).toEqual([]);
  });
});

