/**
 * Battle result types
 */
export type BattleResult = "Victory" | "Defeat" | "Draw";

/**
 * Battle mode types
 */
export type BattleMode =
  | "Ladder"
  | "Path of Legend"
  | "Trophy Road"
  | "2v2"
  | "Challenge"
  | "Tournament"
  | "Friendly"
  | "Special Event"
  | "Unknown";

/**
 * Card in battle
 */
export interface BattleCard {
  name: string;
  level: number;
  is_evolution?: boolean;
}

/**
 * Tower information
 */
export interface TowerInfo {
  type?: string;
  level?: number;
  hp_remaining?: number;
}

/**
 * Battle participant (player or opponent)
 */
export interface BattleParticipant {
  name?: string;
  tag?: string;
  clan?: string;
  trophies?: number;
  trophy_change?: number;
  crowns: number;
  deck: BattleCard[];
  tower?: TowerInfo;
  avg_elixir?: number;
  cycle_cost?: number;
}

/**
 * Complete battle information
 */
export interface Battle {
  result: BattleResult;
  mode: BattleMode;
  time_ago?: string;
  timestamp?: string;
  player: BattleParticipant;
  opponent: BattleParticipant;
}

/**
 * Battle history response
 */
export interface BattleHistory {
  tag: string;
  total_battles: number;
  battles: Battle[];
}
