import { describe, it, expect } from "bun:test";
import { PlayerBasicParser } from "../player-basic.parser";

describe("PlayerBasicParser", () => {
  const mockHTML = `
    <html>
      <head>
        <title>TestPlayer #L2QV2J2RC</title>
      </head>
      <body>
        <div>King Level: 54</div>
        <div>Current Trophies: 9679</div>
        <div>Personal Best: 9769</div>
        <div>Arena 23</div>
        <div>Clan: Elite Warriors</div>
        <div>55.5% win</div>
        <div>1500 total games</div>
        <div>5881 three crown</div>
      </body>
    </html>
  `;

  it("should parse basic player info from HTML", () => {
    const result = PlayerBasicParser.parse(mockHTML, "L2QV2J2RC");

    expect(result).not.toBeNull();
    expect(result?.tag).toBe("#L2QV2J2RC");
    expect(result?.name).toBe("TestPlayer");
    expect(result?.clan).toBeDefined();
  });

  it("should always include clan field (null if not in clan)", () => {
    const htmlNoClan = `<html><head><title>TestPlayer #L2QV2J2RC</title></head><body><div>Not in Clan</div></body></html>`;
    const result = PlayerBasicParser.parse(htmlNoClan, "L2QV2J2RC");
    
    expect(result?.clan).toBe(null);
  });

  it("should set clan to null when player is not in clan", () => {
    const html = `<html><head><title>TestPlayer #L2QV2J2RC</title></head><body></body></html>`;
    const result = PlayerBasicParser.parse(html, "L2QV2J2RC");
    
    expect(result?.clan).toBe(null);
  });

  it("should handle tag with # prefix", () => {
    const result = PlayerBasicParser.parse(mockHTML, "#L2QV2J2RC");
    expect(result?.tag).toBe("#L2QV2J2RC");
  });

  it("should handle tag without # prefix", () => {
    const result = PlayerBasicParser.parse(mockHTML, "l2qv2j2rc");
    expect(result?.tag).toBe("#L2QV2J2RC");
  });

  it("should return null for invalid HTML", () => {
    const result = PlayerBasicParser.parse("", "L2QV2J2RC");
    expect(result).not.toBeNull();
    expect(result?.tag).toBe("#L2QV2J2RC");
  });

  it("should parse king level", () => {
    const html = `<html><body><div>King Level: 54</div></body></html>`;
    const result = PlayerBasicParser.parse(html, "L2QV2J2RC");
    expect(result?.king_level).toBe(54);
  });

  it("should parse trophies from text pattern", () => {
    const html = `<html><body><div>9679 Current Trophies</div></body></html>`;
    const result = PlayerBasicParser.parse(html, "L2QV2J2RC");
    expect(result?.trophies).toBeDefined();
  });
});

