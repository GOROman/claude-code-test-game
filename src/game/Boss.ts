// ボスキャラクター管理

import type { Boss, Bullet, Difficulty } from './types';
import { GAME_WIDTH, GAME_HEIGHT } from './types';
import { drawColoredSprite } from './Sprites';

export class BossManager {
  boss: Boss | null = null;
  private difficulty: Difficulty = 'NORMAL';

  reset(): void {
    this.boss = null;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }

  spawn(stageNumber: number): void {
    const baseHp = 100 + stageNumber * 50;
    const hp = this.difficulty === 'HARD' ? Math.floor(baseHp * 1.5) : baseHp;

    this.boss = {
      x: GAME_WIDTH / 2,
      y: -80,
      width: 80 + stageNumber * 10,
      height: 60 + stageNumber * 8,
      active: true,
      hp,
      maxHp: hp,
      phase: 1,
      patternTimer: 0,
      shootTimer: 0,
      stageNumber,
      defeated: false,
    };
  }

  update(playerX: number, playerY: number, bullets: Bullet[]): boolean {
    if (!this.boss || !this.boss.active) return false;

    this.boss.patternTimer++;
    this.boss.shootTimer++;

    // 登場演出
    if (this.boss.y < 80) {
      this.boss.y += 1;
      return false;
    }

    // フェーズ更新
    this.updatePhase();

    // 移動
    this.updateMovement();

    // 攻撃
    this.updateAttack(playerX, playerY, bullets);

    return true;
  }

  private updatePhase(): void {
    if (!this.boss) return;

    const hpRatio = this.boss.hp / this.boss.maxHp;

    if (hpRatio <= 0.33 && this.boss.phase < 3) {
      this.boss.phase = 3;
    } else if (hpRatio <= 0.66 && this.boss.phase < 2) {
      this.boss.phase = 2;
    }
  }

  private updateMovement(): void {
    if (!this.boss) return;

    const { phase, patternTimer } = this.boss;

    switch (phase) {
      case 1:
        // 左右に移動
        this.boss.x = GAME_WIDTH / 2 + Math.sin(patternTimer * 0.02) * 120;
        break;

      case 2:
        // 8の字
        this.boss.x = GAME_WIDTH / 2 + Math.sin(patternTimer * 0.03) * 100;
        this.boss.y = 80 + Math.sin(patternTimer * 0.06) * 30;
        break;

      case 3:
        // 激しい動き
        this.boss.x = GAME_WIDTH / 2 + Math.sin(patternTimer * 0.04) * 140;
        this.boss.y = 80 + Math.sin(patternTimer * 0.02) * 50 + Math.cos(patternTimer * 0.05) * 20;
        break;
    }

    // 画面内に制限
    this.boss.x = Math.max(this.boss.width / 2, Math.min(GAME_WIDTH - this.boss.width / 2, this.boss.x));
    this.boss.y = Math.max(40, Math.min(GAME_HEIGHT / 2, this.boss.y));
  }

  private updateAttack(playerX: number, playerY: number, bullets: Bullet[]): void {
    if (!this.boss) return;

    const { phase, stageNumber, shootTimer } = this.boss;
    const baseInterval = this.difficulty === 'HARD' ? 15 : 20;
    const shootInterval = Math.max(5, baseInterval - stageNumber * 2);

    if (shootTimer < shootInterval) return;
    this.boss.shootTimer = 0;

    switch (phase) {
      case 1:
        this.attackPhase1(playerX, playerY, bullets);
        break;
      case 2:
        this.attackPhase2(playerX, playerY, bullets);
        break;
      case 3:
        this.attackPhase3(playerX, playerY, bullets);
        break;
    }
  }

  private attackPhase1(playerX: number, playerY: number, bullets: Bullet[]): void {
    if (!this.boss) return;

    // 3方向弾
    const dx = playerX - this.boss.x;
    const dy = playerY - this.boss.y;
    const baseAngle = Math.atan2(dy, dx);
    const speed = 3;

    for (let i = -1; i <= 1; i++) {
      const angle = baseAngle + i * 0.3;
      bullets.push({
        x: this.boss.x,
        y: this.boss.y + this.boss.height / 2,
        width: 10,
        height: 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: 1,
        isPlayerBullet: false,
        active: true,
        color: '#ff0000',
      });
    }
  }

  private attackPhase2(playerX: number, playerY: number, bullets: Bullet[]): void {
    if (!this.boss) return;

    const timer = this.boss.patternTimer;

    // 放射状 + 狙い弾
    if (timer % 30 === 0) {
      const count = 8;
      const speed = 2.5;
      const offset = (timer * 0.1) % (Math.PI * 2);

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + offset;
        bullets.push({
          x: this.boss.x,
          y: this.boss.y,
          width: 8,
          height: 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          damage: 1,
          isPlayerBullet: false,
          active: true,
          color: '#ff6600',
        });
      }
    }

    // 狙い弾
    if (timer % 45 === 0) {
      const dx = playerX - this.boss.x;
      const dy = playerY - this.boss.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 4;

      bullets.push({
        x: this.boss.x,
        y: this.boss.y + this.boss.height / 2,
        width: 12,
        height: 12,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        damage: 1,
        isPlayerBullet: false,
        active: true,
        color: '#ffff00',
      });
    }
  }

  private attackPhase3(playerX: number, playerY: number, bullets: Bullet[]): void {
    if (!this.boss) return;

    const timer = this.boss.patternTimer;

    // 螺旋弾幕
    if (timer % 5 === 0) {
      const angle1 = timer * 0.15;
      const angle2 = -timer * 0.15;
      const speed = 2;

      bullets.push({
        x: this.boss.x,
        y: this.boss.y,
        width: 6,
        height: 6,
        vx: Math.cos(angle1) * speed,
        vy: Math.sin(angle1) * speed + 1,
        damage: 1,
        isPlayerBullet: false,
        active: true,
        color: '#ff00ff',
      });

      bullets.push({
        x: this.boss.x,
        y: this.boss.y,
        width: 6,
        height: 6,
        vx: Math.cos(angle2) * speed,
        vy: Math.sin(angle2) * speed + 1,
        damage: 1,
        isPlayerBullet: false,
        active: true,
        color: '#00ffff',
      });
    }

    // 大弾
    if (timer % 60 === 0) {
      const dx = playerX - this.boss.x;
      const dy = playerY - this.boss.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 2;

      bullets.push({
        x: this.boss.x,
        y: this.boss.y,
        width: 20,
        height: 20,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        damage: 2,
        isPlayerBullet: false,
        active: true,
        color: '#ff0000',
      });
    }
  }

  takeDamage(damage: number): boolean {
    if (!this.boss || !this.boss.active) return false;

    this.boss.hp -= damage;

    if (this.boss.hp <= 0) {
      this.boss.hp = 0;
      this.boss.defeated = true;
      this.boss.active = false;
      return true;
    }

    return false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.boss || !this.boss.active) return;

    const { x, y, width, height, phase, hp, maxHp, stageNumber, patternTimer } = this.boss;

    ctx.save();

    // ステージ別のボスカラー
    const colors = ['#880000', '#884400', '#888800', '#448800', '#008888'];
    const baseColor = colors[(stageNumber - 1) % colors.length];

    // 左ウイング（SVG）
    ctx.globalAlpha = 0.8;
    drawColoredSprite(
      ctx,
      'bossWing',
      baseColor,
      x - width / 2 - 5,
      y,
      30,
      height * 0.8
    );

    // 右ウイング（反転して描画）
    ctx.save();
    ctx.translate(x + width / 2 + 5, y);
    ctx.scale(-1, 1);
    drawColoredSprite(
      ctx,
      'bossWing',
      baseColor,
      0,
      0,
      30,
      height * 0.8
    );
    ctx.restore();
    ctx.globalAlpha = 1;

    // メインボディ（SVG）
    drawColoredSprite(ctx, 'bossBody', baseColor, x, y, width, height);

    // コア（SVG）- フェーズで色が変わる
    const coreColors = ['#ff4444', '#ffaa00', '#ff00ff'];
    const coreSize = 30 + Math.sin(patternTimer * 0.1) * 6;
    drawColoredSprite(ctx, 'bossCore', coreColors[phase - 1], x, y, coreSize, coreSize);

    // HPバー
    const barWidth = width + 40;
    const barHeight = 8;
    const barY = y - height / 2 - 20;

    ctx.fillStyle = '#333333';
    ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);

    const hpRatio = hp / maxHp;
    let hpColor = '#00ff00';
    if (hpRatio < 0.33) hpColor = '#ff0000';
    else if (hpRatio < 0.66) hpColor = '#ffaa00';

    ctx.fillStyle = hpColor;
    ctx.fillRect(x - barWidth / 2, barY, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - barWidth / 2, barY, barWidth, barHeight);

    // ボス名
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`BOSS - STAGE ${stageNumber}`, x, barY - 8);

    ctx.restore();
  }

  getScoreValue(): number {
    if (!this.boss) return 0;
    return 5000 + this.boss.stageNumber * 5000;
  }
}
