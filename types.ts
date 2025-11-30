export interface UserState {
  username: string;
  isOnboarded: boolean;
  balance: number;
  profitPerHour: number;
  energy: number;
  maxEnergy: number;
  lastLogin: number; // timestamp to calculate offline earnings
  level: number;
  purchasedUpgrades: Record<string, number>; // id -> level
  unlockedSkins: string[];
  activeSkin: string;
  walletConnected: boolean;
}

export interface UpgradeItem {
  id: string;
  name: string;
  basePrice: number;
  baseProfit: number;
  category: 'Технологии' | 'Арт' | 'Ивенты' | 'Крипта';
  description: string;
  icon: string;
}

export interface SkinItem {
  id: string;
  name: string;
  price: number;
  colors: [string, string]; // Gradient start/end
  symbol: string;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  balance: number; // Used for sorting
  isCurrentUser: boolean;
}

export enum Tab {
  EXCHANGE = 'exchange',
  MINE = 'mine',
  TOP = 'top',
  AIRDROP = 'airdrop'
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number; // target x translation
  ty: number; // target y translation
  tr: number; // target rotation
  color: string;
}