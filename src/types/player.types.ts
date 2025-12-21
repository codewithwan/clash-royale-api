// Basic player information
export interface PlayerBasicInfo {
  tag: string;
  name?: string;
  king_level?: number;
  trophies?: number;
  best_trophies?: number;
  arena?: number;
  clan: string | null;
  total_games?: number;
  three_crown_wins?: number;
  achievements?: string[];
}

// Card level statistics
export interface CardLevels {
  16: number;
  15: number;
  14: number;
  13: number;
  12: number;
  11: number;
  10: number;
  9: number;
}

export interface CardStats {
  levels: CardLevels;
  total_14_plus: number;
  total_15_plus: number;
}

// Card collections (tower, hero, evolution)
export interface CardCollection {
  count: number;
  cards: string[];
}

export interface PlayerCollections {
  tower: string[];
  hero: string[];
  evolution: string[];
}

// Complete player data
export interface PlayerData {
  tag: string;
  name?: string;
  king_level?: number;
  trophies?: number;
  best_trophies?: number;
  arena?: number;
  clan: string | null;
  win_rate?: number;
  total_games?: number;
  three_crown_wins?: number;
  wins?: number;
  losses?: number;
  cards:
    | (CardStats & {
        by_rarity: {
          champion: number;
          evolution: number;
        };
      })
    | null;
  towers: CardCollection;
  heroes: CardCollection;
  evolutions: CardCollection;
}
