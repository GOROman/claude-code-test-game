// ゲームの型定義

export interface Vector2 {
  x: number;
  y: number;
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface Bullet extends GameObject {
  vx: number;
  vy: number;
  damage: number;
  isPlayerBullet: boolean;
  color: string;
}

export interface PlayerState extends GameObject {
  lives: number;
  bombs: number;
  score: number;
  invincible: boolean;
  invincibleTimer: number;
  isFocused: boolean;
  powerLevel: number;
}

export type EnemyType =
  | 'ZakoA'
  | 'ZakoB'
  | 'Spinner'
  | 'Hatch'
  | 'Zoomer'
  | 'RockTurret'
  | 'GroundTurret'
  | 'LaserTrap'
  | 'Debris'
  | 'ItemCarrier';

export interface Enemy extends GameObject {
  type: EnemyType;
  hp: number;
  maxHp: number;
  vx: number;
  vy: number;
  shootTimer: number;
  movePattern: number;
  patternTimer: number;
  scoreValue: number;
}

export type BossPhase = 1 | 2 | 3;

export interface Boss extends GameObject {
  hp: number;
  maxHp: number;
  phase: BossPhase;
  patternTimer: number;
  shootTimer: number;
  stageNumber: number;
  defeated: boolean;
}

export interface Item extends GameObject {
  type: 'power' | 'bomb' | 'life' | 'score';
  vy: number;
}

export interface Explosion extends GameObject {
  timer: number;
  maxTimer: number;
  radius: number;
}

export type Difficulty = 'NORMAL' | 'HARD';

export interface GameState {
  stage: number;
  difficulty: Difficulty;
  paused: boolean;
  gameOver: boolean;
  stageClear: boolean;
  highScore: number;
  scrollY: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  bomb: boolean;
  focus: boolean;
  start: boolean;
}

export const GAME_WIDTH = 384;
export const GAME_HEIGHT = 448;
export const PLAYER_SPEED = 3.0;
export const PLAYER_FOCUS_SPEED = 1.5;
