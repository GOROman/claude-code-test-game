// プレイヤー管理

import type { PlayerState, Bullet, InputState } from './types';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_FOCUS_SPEED } from './types';
import { drawSprite } from './Sprites';

export class Player {
  state: PlayerState;
  private shootCooldown: number = 0;
  private bombCooldown: number = 0;
  private readonly SHOOT_INTERVAL = 5; // フレーム
  private readonly BOMB_COOLDOWN = 60; // フレーム
  private readonly INVINCIBLE_DURATION = 180; // 3秒

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): PlayerState {
    return {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 60,
      width: 8,
      height: 8,
      active: true,
      lives: 3,
      bombs: 3,
      score: 0,
      invincible: false,
      invincibleTimer: 0,
      isFocused: false,
      powerLevel: 0,
    };
  }

  reset(): void {
    this.state = this.createInitialState();
    this.shootCooldown = 0;
    this.bombCooldown = 0;
  }

  respawn(): void {
    this.state.x = GAME_WIDTH / 2;
    this.state.y = GAME_HEIGHT - 60;
    this.state.invincible = true;
    this.state.invincibleTimer = this.INVINCIBLE_DURATION;
    this.state.active = true;
    this.state.powerLevel = Math.max(0, this.state.powerLevel - 1);
  }

  update(input: InputState, bullets: Bullet[]): void {
    if (!this.state.active) return;

    // 移動処理
    this.state.isFocused = input.focus;
    const speed = input.focus ? PLAYER_FOCUS_SPEED : PLAYER_SPEED;

    if (input.up) this.state.y -= speed;
    if (input.down) this.state.y += speed;
    if (input.left) this.state.x -= speed;
    if (input.right) this.state.x += speed;

    // 画面内に制限
    const margin = 16;
    this.state.x = Math.max(margin, Math.min(GAME_WIDTH - margin, this.state.x));
    this.state.y = Math.max(margin, Math.min(GAME_HEIGHT - margin, this.state.y));

    // 無敵時間の更新
    if (this.state.invincible) {
      this.state.invincibleTimer--;
      if (this.state.invincibleTimer <= 0) {
        this.state.invincible = false;
      }
    }

    // クールダウン更新
    if (this.shootCooldown > 0) this.shootCooldown--;
    if (this.bombCooldown > 0) this.bombCooldown--;

    // ショット
    if (input.shoot && this.shootCooldown <= 0) {
      this.shoot(bullets);
      this.shootCooldown = this.SHOOT_INTERVAL;
    }
  }

  private shoot(bullets: Bullet[]): void {
    const baseX = this.state.x;
    const baseY = this.state.y - 10;

    // メインショット
    bullets.push(this.createBullet(baseX, baseY, 0, -12));

    // パワーレベルによる追加弾
    if (this.state.powerLevel >= 1) {
      bullets.push(this.createBullet(baseX - 10, baseY + 5, -1, -11));
      bullets.push(this.createBullet(baseX + 10, baseY + 5, 1, -11));
    }

    if (this.state.powerLevel >= 2) {
      bullets.push(this.createBullet(baseX - 18, baseY + 10, -2, -10));
      bullets.push(this.createBullet(baseX + 18, baseY + 10, 2, -10));
    }

    if (this.state.powerLevel >= 3) {
      bullets.push(this.createBullet(baseX, baseY - 5, 0, -14));
    }
  }

  private createBullet(x: number, y: number, vx: number, vy: number): Bullet {
    return {
      x,
      y,
      width: 4,
      height: 12,
      vx,
      vy,
      damage: 1,
      isPlayerBullet: true,
      active: true,
      color: '#00ffff',
    };
  }

  useBomb(): boolean {
    if (this.bombCooldown > 0 || this.state.bombs <= 0) {
      return false;
    }
    this.state.bombs--;
    this.bombCooldown = this.BOMB_COOLDOWN;
    this.state.invincible = true;
    this.state.invincibleTimer = 120; // ボム中は無敵
    return true;
  }

  hit(): boolean {
    if (this.state.invincible) {
      return false;
    }

    this.state.lives--;
    if (this.state.lives <= 0) {
      this.state.active = false;
      return true; // ゲームオーバー
    }

    this.respawn();
    return false;
  }

  addScore(points: number): void {
    this.state.score += points;
  }

  powerUp(): void {
    if (this.state.powerLevel < 3) {
      this.state.powerLevel++;
    } else {
      this.addScore(1000); // MAXの時はスコアボーナス
    }
  }

  addBomb(): void {
    if (this.state.bombs < 6) {
      this.state.bombs++;
    } else {
      this.addScore(1000);
    }
  }

  addLife(): void {
    if (this.state.lives < 6) {
      this.state.lives++;
    } else {
      this.addScore(10000);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.state.active) return;

    // 無敵中は点滅
    if (this.state.invincible && Math.floor(this.state.invincibleTimer / 4) % 2 === 0) {
      return;
    }

    const { x, y } = this.state;

    ctx.save();

    // エンジンの炎（SVG）
    const flameOffset = Math.random() * 4;
    drawSprite(ctx, 'playerFlame', x, y + 14 + flameOffset, 12, 12 + flameOffset);

    // 自機の描画（SVG）
    drawSprite(ctx, 'player', x, y, 32, 32);

    // 精密移動中は当たり判定を表示
    if (this.state.isFocused) {
      ctx.strokeStyle = '#ff0066';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
