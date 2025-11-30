import { SkinItem, UpgradeItem, LeaderboardUser } from './types';

export const LEVEL_THRESHOLDS = [
  { name: 'Хомяк', threshold: 0 },
  { name: 'Новичок', threshold: 5000 },
  { name: 'Трейдер', threshold: 25000 },
  { name: 'Кит', threshold: 100000 },
  { name: 'Сатоши', threshold: 1000000 },
];

export const SKINS: SkinItem[] = [
  { id: 'furcoin', name: 'FurCoin', price: 0, colors: ['#facc15', '#ca8a04'], symbol: 'FC' },
  { id: 'ton', name: 'TON', price: 10000, colors: ['#0098EA', '#006296'], symbol: '💎' },
  { id: 'btc', name: 'Bitcoin', price: 50000, colors: ['#F7931A', '#B56000'], symbol: '₿' },
  { id: 'eth', name: 'Ethereum', price: 100000, colors: ['#627EEA', '#3C4D8F'], symbol: 'Ξ' },
  { id: 'not', name: 'Notcoin', price: 200000, colors: ['#000000', '#333333'], symbol: 'NOT' },
];

export const UPGRADES: UpgradeItem[] = [
  // Технологии
  { id: 'gpu_rig', name: 'GPU Ферма', basePrice: 500, baseProfit: 50, category: 'Технологии', description: 'Базовая настройка майнинга', icon: '💻' },
  { id: 'asic_miner', name: 'ASIC Майнер', basePrice: 2000, baseProfit: 250, category: 'Технологии', description: 'Профессиональное железо', icon: '🔋' },
  { id: 'quantum_pc', name: 'Квантовый ПК', basePrice: 15000, baseProfit: 1200, category: 'Технологии', description: 'Вычисления нового поколения', icon: '⚛️' },
  
  // Арт
  { id: 'nft_collection', name: 'NFT Коллекция', basePrice: 1000, baseProfit: 100, category: 'Арт', description: 'Пиксель-арт картинки', icon: '🖼️' },
  { id: 'digital_gallery', name: 'Цифровая Галерея', basePrice: 5000, baseProfit: 600, category: 'Арт', description: 'VR выставка', icon: '🕶️' },
  
  // Ивенты
  { id: 'ama_session', name: 'AMA Сессия', basePrice: 750, baseProfit: 80, category: 'Ивенты', description: 'Разговор с комьюнити', icon: '🎤' },
  { id: 'hackathon', name: 'Хакатон', basePrice: 3000, baseProfit: 400, category: 'Ивенты', description: 'Соревнование девов', icon: '🏆' },
  
  // Крипта
  { id: 'staking', name: 'Стейкинг V1', basePrice: 1500, baseProfit: 180, category: 'Крипта', description: 'Пассивный доход', icon: '📈' },
  { id: 'dex_listing', name: 'Листинг на DEX', basePrice: 10000, baseProfit: 950, category: 'Крипта', description: 'Пул ликвидности', icon: '🦄' },
  { id: 'cex_listing', name: 'Листинг на CEX', basePrice: 50000, baseProfit: 4000, category: 'Крипта', description: 'Крупная биржа', icon: '🏦' },
];

export const WALLET_ADDRESS = "UQA8zne0aKVtdJuwKdqQkhxA9LKetlubeGEQ_NKsb1plvks2";

// Mock Database of users for the leaderboard
export const INITIAL_LEADERBOARD_BOTS: LeaderboardUser[] = [
    { id: 'bot1', rank: 1, name: "CryptoKing", balance: 1500000, isCurrentUser: false },
    { id: 'bot2', rank: 2, name: "TonWhale", balance: 980000, isCurrentUser: false },
    { id: 'bot3', rank: 3, name: "ElonMusk_Real", balance: 500000, isCurrentUser: false },
    { id: 'bot4', rank: 4, name: "Durov", balance: 250000, isCurrentUser: false },
    { id: 'bot5', rank: 5, name: "NotCoiner", balance: 100000, isCurrentUser: false },
    { id: 'bot6', rank: 6, name: "HamsterKombat", balance: 50000, isCurrentUser: false },
    { id: 'bot7', rank: 7, name: "Vitalik", balance: 25000, isCurrentUser: false },
    { id: 'bot8', rank: 8, name: "Satoshi_N", balance: 10000, isCurrentUser: false },
    { id: 'bot9', rank: 9, name: "PepeFrog", balance: 5000, isCurrentUser: false },
    { id: 'bot10', rank: 10, name: "DogeFan", balance: 1000, isCurrentUser: false },
];