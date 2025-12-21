import { describe, test, expect } from "bun:test";
import { PlayerBattlesParser } from "../player-battles.parser";

describe("PlayerBattlesParser", () => {
  describe("parse", () => {
    test("should return empty battles array for empty HTML", () => {
      const html = "<html><body></body></html>";
      const result = PlayerBattlesParser.parse(html, "L2QV2J2RC");

      expect(result.tag).toBe("#L2QV2J2RC");
      expect(result.total_battles).toBe(0);
      expect(result.battles).toEqual([]);
    });

    test("should normalize player tag correctly", () => {
      const html = "<html><body></body></html>";

      const result1 = PlayerBattlesParser.parse(html, "L2QV2J2RC");
      expect(result1.tag).toBe("#L2QV2J2RC");

      const result2 = PlayerBattlesParser.parse(html, "#L2QV2J2RC");
      expect(result2.tag).toBe("#L2QV2J2RC");

      const result3 = PlayerBattlesParser.parse(html, "l2qv2j2rc");
      expect(result3.tag).toBe("#L2QV2J2RC");
    });

    test("should parse battle result correctly", () => {
      const html = `
        <html>
          <body>
            <div class="battle_list_battle">
              <div class="ui left ribbon label blue">Victory</div>
              <h4 class="game_mode_header">Ladder</h4>
              <div class="result_header">3 - 0</div>
              <div class="team-segment">
                <a class="player_name_header">TestPlayer</a>
                <div class="deck_card__four_wide">
                  <div class="card-level">Lvl 15</div>
                  <img class="deck_card" data-card-key="pekka" />
                </div>
              </div>
              <div class="team-segment">
                <a class="player_name_header">Opponent</a>
                <div class="deck_card__four_wide">
                  <div class="card-level">Lvl 14</div>
                  <img class="deck_card" data-card-key="giant" />
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = PlayerBattlesParser.parse(html, "L2QV2J2RC");

      expect(result.total_battles).toBe(1);
      expect(result.battles[0]?.result).toBe("Victory");
      expect(result.battles[0]?.mode).toBe("Ladder");
    });

    test("should parse crown scores correctly", () => {
      const html = `
        <html>
          <body>
            <div class="battle_list_battle">
              <div class="ui left ribbon label red">Defeat</div>
              <div class="result_header">1 - 3</div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="pekka" />
                </div>
              </div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="giant" />
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = PlayerBattlesParser.parse(html, "TEST");

      expect(result.total_battles).toBe(1);
      expect(result.battles[0]?.player.crowns).toBe(1);
      expect(result.battles[0]?.opponent.crowns).toBe(3);
    });

    test("should parse player and opponent names", () => {
      const html = `
        <html>
          <body>
            <div class="battle_list_battle">
              <div class="ui left ribbon label blue">Victory</div>
              <div class="team-segment">
                <a class="player_name_header">PlayerOne</a>
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="pekka" />
                </div>
              </div>
              <div class="team-segment">
                <a class="player_name_header">PlayerTwo</a>
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="giant" />
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = PlayerBattlesParser.parse(html, "TEST");

      expect(result.battles[0]?.player.name).toBe("PlayerOne");
      expect(result.battles[0]?.opponent.name).toBe("PlayerTwo");
    });

    test("should parse deck cards correctly", () => {
      const html = `
        <html>
          <body>
            <div class="battle_list_battle">
              <div class="ui left ribbon label blue">Victory</div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <div class="card-level">Lvl 15</div>
                  <img class="deck_card" data-card-key="pekka" />
                </div>
                <div class="deck_card__four_wide">
                  <div class="card-level">Lvl 14</div>
                  <img class="deck_card" data-card-key="mega-knight" />
                </div>
                <div class="deck_card__four_wide">
                  <div class="card-level">Lvl 16</div>
                  <img class="deck_card" data-card-key="firecracker-ev1" />
                </div>
              </div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <div class="card-level">Lvl 13</div>
                  <img class="deck_card" data-card-key="giant" />
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = PlayerBattlesParser.parse(html, "TEST");

      expect(result.battles[0]?.player.deck).toHaveLength(3);
      expect(result.battles[0]?.player.deck[0]?.name).toBe("Pekka");
      expect(result.battles[0]?.player.deck[0]?.level).toBe(15);
      expect(result.battles[0]?.player.deck[0]?.is_evolution).toBe(false);

      expect(result.battles[0]?.player.deck[1]?.name).toBe("Mega Knight");
      expect(result.battles[0]?.player.deck[1]?.level).toBe(14);

      expect(result.battles[0]?.player.deck[2]?.name).toBe("Firecracker");
      expect(result.battles[0]?.player.deck[2]?.level).toBe(16);
      expect(result.battles[0]?.player.deck[2]?.is_evolution).toBe(true);

      expect(result.battles[0]?.opponent.deck).toHaveLength(1);
      expect(result.battles[0]?.opponent.deck[0]?.name).toBe("Giant");
    });

    test("should parse trophy changes correctly", () => {
      const html = `
        <html>
          <body>
            <div class="battle_list_battle">
              <div class="ui left ribbon label blue">Victory</div>
              <div class="team-segment">
                <div class="trophy_container">
                  <div class="ui basic blue label">+30</div>
                </div>
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="pekka" />
                </div>
              </div>
              <div class="team-segment">
                <div class="trophy_container">
                  <div class="ui basic red label">-28</div>
                </div>
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="giant" />
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = PlayerBattlesParser.parse(html, "TEST");

      expect(result.battles[0]?.player.trophy_change).toBe(30);
      expect(result.battles[0]?.opponent.trophy_change).toBe(-28);
    });

    test("should parse multiple battles", () => {
      const html = `
        <html>
          <body>
            <div class="battle_list_battle">
              <div class="ui left ribbon label blue">Victory</div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="pekka" />
                </div>
              </div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="giant" />
                </div>
              </div>
            </div>
            <div class="battle_list_battle">
              <div class="ui left ribbon label red">Defeat</div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="hog-rider" />
                </div>
              </div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="golem" />
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = PlayerBattlesParser.parse(html, "TEST");

      expect(result.total_battles).toBe(2);
      expect(result.battles[0]?.result).toBe("Victory");
      expect(result.battles[1]?.result).toBe("Defeat");
    });

    test("should skip battles with invalid data", () => {
      const html = `
        <html>
          <body>
            <div class="battle_list_battle">
              <!-- Invalid battle without players -->
              <div class="ui left ribbon label blue">Victory</div>
            </div>
            <div class="battle_list_battle">
              <div class="ui left ribbon label red">Defeat</div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="pekka" />
                </div>
              </div>
              <div class="team-segment">
                <div class="deck_card__four_wide">
                  <img class="deck_card" data-card-key="giant" />
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      const result = PlayerBattlesParser.parse(html, "TEST");

      // Should only have 1 battle (the second one with valid card data)
      expect(result.total_battles).toBe(1);
      expect(result.battles[0]?.result).toBe("Defeat");
    });

    test("should parse battle modes correctly", () => {
      const testCases = [
        { mode: "Ladder", expected: "Ladder" },
        { mode: "Path of Legend", expected: "Path of Legend" },
        { mode: "2v2", expected: "2v2" },
        { mode: "Challenge", expected: "Challenge" },
        { mode: "Tournament", expected: "Tournament" },
        { mode: "Friendly Battle", expected: "Friendly" },
        { mode: "Special Event", expected: "Special Event" },
      ];

      testCases.forEach(({ mode, expected }) => {
        const html = `
          <html>
            <body>
              <div class="battle_list_battle">
                <h4 class="game_mode_header">${mode}</h4>
                <div class="team-segment">
                  <div class="deck_card__four_wide">
                    <img class="deck_card" data-card-key="pekka" />
                  </div>
                </div>
                <div class="team-segment">
                  <div class="deck_card__four_wide">
                    <img class="deck_card" data-card-key="giant" />
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        const result = PlayerBattlesParser.parse(html, "TEST");
        expect(result.battles[0]?.mode).toBe(expected as any);
      });
    });
  });
});
