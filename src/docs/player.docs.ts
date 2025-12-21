import { t } from "elysia";

export const playerTagParam = t.Object({
  tag: t.String({
    description:
      "Player tag (with or without #). Must be 8-9 alphanumeric characters",
    examples: ["L2QV2J2RC", "#L2QV2J2RC"],
  }),
});

export const playerTagParamSimple = t.Object({
  tag: t.String({
    description: "Player tag (8-9 alphanumeric characters)",
    examples: ["L2QV2J2RC", "#L2QV2J2RC"],
  }),
});

const errorResponseSchema = {
  type: "object" as const,
  properties: {
    success: { type: "boolean" as const, example: false },
    error: {
      type: "object" as const,
      properties: {
        code: { type: "string" as const },
        message: { type: "string" as const },
      },
    },
  },
};

const metaSchema = {
  type: "object" as const,
  properties: {
    timestamp: { type: "string" as const, format: "date-time" },
    cached: { type: "boolean" as const, example: false },
    source: { type: "string" as const, example: "royaleapi.com" },
    version: { type: "string" as const, example: "v1" },
  },
};

export const getPlayerDataDocs = {
  tags: ["Player"],
  summary: "Get complete player data",
  description: `Get comprehensive player information including:
- Basic stats (name, level, trophies, arena)
- Clan information (if in a clan)
- Battle statistics (3-crown wins)
- Achievements/badges unlocked (if any)
- Card level breakdown (levels 9-16)
- Tower cards collection
- Hero/Champion cards collection  
- Evolution cards collection

**Note:** All card collections only include unlocked cards. The 'clan' field is always present (null if not in a clan).`,
  responses: {
    200: {
      description: "Success - Player data retrieved",
      content: {
        "application/json": {
          schema: {
            type: "object" as const,
            properties: {
              success: { type: "boolean" as const, example: true },
              data: {
                type: "object" as const,
                properties: {
                  tag: { type: "string" as const, example: "#L2QV2J2RC" },
                  name: { type: "string" as const, example: "P.E.K.A" },
                  king_level: { type: "number" as const, example: 54 },
                  trophies: { type: "number" as const, example: 9679 },
                  best_trophies: { type: "number" as const, example: 9769 },
                  arena: { type: "number" as const, example: 23 },
                  clan: {
                    type: "string" as const,
                    nullable: true,
                    example: "Elite Warriors",
                    description: "Clan name, or null if not in a clan",
                  },
                  three_crown_wins: { type: "number" as const, example: 5881 },
                  achievements: {
                    type: "array" as const,
                    items: { type: "string" as const },
                    example: [
                      "2v2",
                      "Battle Wins",
                      "Card Collection",
                      "Donations",
                      "Double Elixir",
                      "Draft Wins",
                      "Ramp Up",
                      "Sudden Death",
                    ],
                    description:
                      "Optional - array of unlocked achievement/badge names",
                  },
                  cards: {
                    type: "object" as const,
                    properties: {
                      levels: {
                        type: "object" as const,
                        properties: {
                          "16": { type: "number" as const },
                          "15": { type: "number" as const },
                          "14": { type: "number" as const },
                          "13": { type: "number" as const },
                          "12": { type: "number" as const },
                          "11": { type: "number" as const },
                          "10": { type: "number" as const },
                          "9": { type: "number" as const },
                        },
                      },
                      total_14_plus: { type: "number" as const },
                      total_15_plus: { type: "number" as const },
                      by_rarity: {
                        type: "object" as const,
                        properties: {
                          champion: { type: "number" as const },
                          evolution: { type: "number" as const },
                        },
                      },
                    },
                  },
                  towers: {
                    type: "object" as const,
                    properties: {
                      count: { type: "number" as const, example: 4 },
                      cards: {
                        type: "array" as const,
                        items: { type: "string" as const },
                        example: ["Tower Princess", "Cannoneer"],
                      },
                    },
                  },
                  heroes: {
                    type: "object" as const,
                    properties: {
                      count: { type: "number" as const, example: 1 },
                      cards: {
                        type: "array" as const,
                        items: { type: "string" as const },
                        example: ["Golden Knight"],
                      },
                    },
                  },
                  evolutions: {
                    type: "object" as const,
                    properties: {
                      count: { type: "number" as const, example: 16 },
                      cards: {
                        type: "array" as const,
                        items: { type: "string" as const },
                        example: ["Archers", "Barbarians", "Knight"],
                      },
                    },
                  },
                },
              },
              meta: metaSchema,
            },
          },
        },
      },
    },
    400: {
      description: "Bad Request - Invalid player tag format",
      content: {
        "application/json": {
          schema: {
            ...errorResponseSchema,
            properties: {
              ...errorResponseSchema.properties,
              error: {
                ...errorResponseSchema.properties.error,
                properties: {
                  code: { type: "string" as const, example: "INVALID_TAG" },
                  message: {
                    type: "string" as const,
                    example: "Invalid player tag format: ABC",
                  },
                },
              },
            },
          },
        },
      },
    },
    404: {
      description: "Not Found - Player does not exist",
      content: {
        "application/json": {
          schema: {
            ...errorResponseSchema,
            properties: {
              ...errorResponseSchema.properties,
              error: {
                ...errorResponseSchema.properties.error,
                properties: {
                  code: {
                    type: "string" as const,
                    example: "PLAYER_NOT_FOUND",
                  },
                  message: {
                    type: "string" as const,
                    example: "Player with tag #L2QV2J2RC not found",
                  },
                },
              },
            },
          },
        },
      },
    },
    500: {
      description: "Internal Server Error - Parsing failed",
      content: {
        "application/json": {
          schema: {
            ...errorResponseSchema,
            properties: {
              ...errorResponseSchema.properties,
              error: {
                ...errorResponseSchema.properties.error,
                properties: {
                  code: { type: "string" as const, example: "PARSING_ERROR" },
                  message: {
                    type: "string" as const,
                    example: "Failed to parse player data",
                  },
                },
              },
            },
          },
        },
      },
    },
    503: {
      description: "Service Unavailable - Network error",
      content: {
        "application/json": {
          schema: {
            ...errorResponseSchema,
            properties: {
              ...errorResponseSchema.properties,
              error: {
                ...errorResponseSchema.properties.error,
                properties: {
                  code: { type: "string" as const, example: "NETWORK_ERROR" },
                  message: {
                    type: "string" as const,
                    example: "Network error while fetching player data",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const getPlayerCardsDocs = {
  tags: ["Player"],
  summary: "Get player card statistics",
  description: `Get player's card level breakdown showing number of cards at each level (9-16).

**Includes:**
- Count of cards at each level
- Total cards at level 14+
- Total cards at level 15+`,
  responses: {
    200: {
      description: "Success - Card statistics retrieved",
      content: {
        "application/json": {
          schema: {
            type: "object" as const,
            properties: {
              success: { type: "boolean" as const, example: true },
              data: {
                type: "object" as const,
                properties: {
                  levels: {
                    type: "object" as const,
                    properties: {
                      "16": { type: "number" as const, example: 5 },
                      "15": { type: "number" as const, example: 10 },
                      "14": { type: "number" as const, example: 20 },
                      "13": { type: "number" as const, example: 15 },
                      "12": { type: "number" as const, example: 12 },
                      "11": { type: "number" as const, example: 8 },
                      "10": { type: "number" as const, example: 5 },
                      "9": { type: "number" as const, example: 3 },
                    },
                  },
                  total_14_plus: { type: "number" as const, example: 35 },
                  total_15_plus: { type: "number" as const, example: 15 },
                },
              },
              meta: metaSchema,
            },
          },
        },
      },
    },
    400: { description: "Bad Request - Invalid tag format" },
    404: { description: "Not Found - Player not found" },
    500: { description: "Internal Server Error" },
    503: { description: "Service Unavailable" },
  },
};

export const getPlayerCollectionsDocs = {
  tags: ["Player"],
  summary: "Get player card collections",
  description: `Get lists of unlocked special cards:

**Tower Cards:** Special tower skins (Tower Princess, Cannoneer, etc.)

**Hero/Champion Cards:** Champion cards (Golden Knight, Archer Queen, etc.)

**Evolution Cards:** Evolution-capable cards (Archers, Barbarians, Knight, etc.)

**Note:** Only unlocked cards are returned. Locked/greyed-out cards are excluded.`,
  responses: {
    200: {
      description: "Success - Card collections retrieved",
      content: {
        "application/json": {
          schema: {
            type: "object" as const,
            properties: {
              success: { type: "boolean" as const, example: true },
              data: {
                type: "object" as const,
                properties: {
                  tower: {
                    type: "object" as const,
                    properties: {
                      count: { type: "number" as const, example: 4 },
                      cards: {
                        type: "array" as const,
                        items: { type: "string" as const },
                        example: [
                          "Tower Princess",
                          "Cannoneer",
                          "Dagger Duchess",
                          "Royal Chef",
                        ],
                      },
                    },
                  },
                  hero: {
                    type: "object" as const,
                    properties: {
                      count: { type: "number" as const, example: 1 },
                      cards: {
                        type: "array" as const,
                        items: { type: "string" as const },
                        example: ["Golden Knight"],
                      },
                    },
                  },
                  evolution: {
                    type: "object" as const,
                    properties: {
                      count: { type: "number" as const, example: 16 },
                      cards: {
                        type: "array" as const,
                        items: { type: "string" as const },
                        example: [
                          "Archers",
                          "Barbarians",
                          "Knight",
                          "Royal Giant",
                        ],
                      },
                    },
                  },
                },
              },
              meta: metaSchema,
            },
          },
        },
      },
    },
    400: { description: "Bad Request - Invalid tag format" },
    404: { description: "Not Found - Player not found" },
    500: { description: "Internal Server Error" },
    503: { description: "Service Unavailable" },
  },
};

export const getPlayerCardsByLevelDocs = {
  tags: ["Player"],
  summary: "Get player cards grouped by level",
  description: `Get all player's cards organized by their level (9-16).

Returns a list where each entry contains:
- Level number (16-9, sorted descending)
- Count of cards at that level
- Array of card names at that level (sorted alphabetically)

Useful for seeing exactly which cards a player has at each level.`,
  responses: {
    200: {
      description: "Success - Cards by level retrieved",
      content: {
        "application/json": {
          schema: {
            type: "object" as const,
            properties: {
              success: { type: "boolean" as const, example: true },
              data: {
                type: "array" as const,
                items: {
                  type: "object" as const,
                  properties: {
                    level: { type: "number" as const, example: 16 },
                    count: { type: "number" as const, example: 5 },
                    cards: {
                      type: "array" as const,
                      items: { type: "string" as const },
                      example: [
                        "Archers",
                        "Firecracker",
                        "Knight",
                        "Mortar",
                        "Royal Giant",
                      ],
                    },
                  },
                },
              },
              meta: metaSchema,
            },
          },
        },
      },
    },
    400: { description: "Bad Request - Invalid tag format" },
    404: { description: "Not Found - Player not found" },
    500: { description: "Internal Server Error" },
    503: { description: "Service Unavailable" },
  },
};

export const getPlayerBattlesDocs = {
  tags: ["Player"],
  summary: "Get player battle history",
  description: `Get player's recent battle history including:
- Battle result (Victory/Defeat/Draw)
- Game mode (Ladder, 2v2, Challenge, etc.)
- Player and opponent decks with card levels
- Trophy changes
- Crown scores
- Tower information
- Time since battle

Returns the most recent battles available on RoyaleAPI.`,
  responses: {
    200: {
      description: "Success - Battle history retrieved",
      content: {
        "application/json": {
          schema: {
            type: "object" as const,
            properties: {
              success: { type: "boolean" as const, example: true },
              data: {
                type: "object" as const,
                properties: {
                  tag: { type: "string" as const, example: "#L2QV2J2RC" },
                  total_battles: { type: "number" as const, example: 25 },
                  battles: {
                    type: "array" as const,
                    items: {
                      type: "object" as const,
                      properties: {
                        result: {
                          type: "string" as const,
                          enum: ["Victory", "Defeat", "Draw"],
                          example: "Victory",
                        },
                        mode: {
                          type: "string" as const,
                          example: "Ladder",
                        },
                        time_ago: {
                          type: "string" as const,
                          example: "1d 7h 10m",
                        },
                        player: {
                          type: "object" as const,
                          properties: {
                            name: {
                              type: "string" as const,
                              example: "P.E.K.A",
                            },
                            clan: {
                              type: "string" as const,
                              example: "Elite Warriors",
                            },
                            trophies: {
                              type: "number" as const,
                              example: 9679,
                            },
                            trophy_change: {
                              type: "number" as const,
                              example: 30,
                            },
                            crowns: { type: "number" as const, example: 3 },
                            deck: {
                              type: "array" as const,
                              items: {
                                type: "object" as const,
                                properties: {
                                  name: {
                                    type: "string" as const,
                                    example: "P.E.K.K.A",
                                  },
                                  level: {
                                    type: "number" as const,
                                    example: 15,
                                  },
                                  is_evolution: {
                                    type: "boolean" as const,
                                    example: false,
                                  },
                                },
                              },
                            },
                            tower: {
                              type: "object" as const,
                              properties: {
                                level: { type: "number" as const, example: 15 },
                              },
                            },
                            avg_elixir: {
                              type: "number" as const,
                              example: 3.6,
                            },
                            cycle_cost: {
                              type: "number" as const,
                              example: 2.1,
                            },
                          },
                        },
                        opponent: {
                          type: "object" as const,
                          properties: {
                            name: {
                              type: "string" as const,
                              example: "Opponent",
                            },
                            clan: {
                              type: "string" as const,
                              example: "Some Clan",
                            },
                            trophies: {
                              type: "number" as const,
                              example: 9650,
                            },
                            trophy_change: {
                              type: "number" as const,
                              example: -28,
                            },
                            crowns: { type: "number" as const, example: 0 },
                            deck: {
                              type: "array" as const,
                              items: {
                                type: "object" as const,
                                properties: {
                                  name: {
                                    type: "string" as const,
                                    example: "Giant",
                                  },
                                  level: {
                                    type: "number" as const,
                                    example: 14,
                                  },
                                  is_evolution: {
                                    type: "boolean" as const,
                                    example: false,
                                  },
                                },
                              },
                            },
                            tower: {
                              type: "object" as const,
                              properties: {
                                level: { type: "number" as const, example: 14 },
                              },
                            },
                            avg_elixir: {
                              type: "number" as const,
                              example: 3.8,
                            },
                            cycle_cost: {
                              type: "number" as const,
                              example: 2.3,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              meta: metaSchema,
            },
          },
        },
      },
    },
    400: { description: "Bad Request - Invalid tag format" },
    404: { description: "Not Found - Player not found" },
    500: { description: "Internal Server Error" },
    503: { description: "Service Unavailable" },
  },
};
