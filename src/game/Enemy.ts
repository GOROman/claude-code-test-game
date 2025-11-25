// 敵キャラクター管理

import type { Enemy, EnemyType, Bullet } from './types';
import { GAME_WIDTH, GAME_HEIGHT } from './types';

export class EnemyManager {
  enemies: Enemy[] = [];
  private spawnTimer: number = 0;
  private stageProgress: number = 0;

  reset(): void {
    this.enemies = [];
    this.spawnTimer = 0;
    this.stageProgress = 0;
  }

  update(playerX: number, playerY: number, bullets: Bullet[], stage: number): void {
    this.stageProgress++;
    this.spawnTimer++;

    // ステージに応じた敵のスポーン
    this.spawnEnemies(stage);

    // 敵の更新
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      this.updateEnemy(enemy, playerX, playerY, bullets);
    }

    // 非アクティブな敵を削除
    this.enemies = this.enemies.filter((e) => e.active);
  }

  private spawnEnemies(stage: number): void {
    const spawnRate = Math.max(30, 60 - stage * 5);

    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer = 0;

      // ランダムな敵タイプを選択
      const types: EnemyType[] = ['ZakoA', 'ZakoB', 'Spinner', 'Zoomer', 'ItemCarrier'];
      const weights = [0.3, 0.25, 0.2, 0.15, 0.1];

      let rand = Math.random();
      let selectedType: EnemyType = 'ZakoA';

      for (let i = 0; i < types.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          selectedType = types[i];
          break;
        }
      }

      this.spawn(selectedType, stage);
    }

    // 追加の固定砲台をスポーン
    if (this.stageProgress % 300 === 0) {
      this.spawn('GroundTurret', stage);
    }
  }

  spawn(type: EnemyType, stage: number): void {
    const enemy = this.createEnemy(type, stage);
    this.enemies.push(enemy);
  }

  private createEnemy(type: EnemyType, stage: number): Enemy {
    const baseEnemy: Enemy = {
      x: Math.random() * (GAME_WIDTH - 60) + 30,
      y: -30,
      width: 24,
      height: 24,
      active: true,
      type,
      hp: 1,
      maxHp: 1,
      vx: 0,
      vy: 1,
      shootTimer: 0,
      movePattern: 0,
      patternTimer: 0,
      scoreValue: 100,
    };

    // タイプ別の設定
    switch (type) {
      case 'ZakoA':
        baseEnemy.hp = 1 + stage;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 2;
        baseEnemy.scoreValue = 100;
        break;

      case 'ZakoB':
        baseEnemy.hp = 2 + stage;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 1.5;
        baseEnemy.scoreValue = 150;
        break;

      case 'Spinner':
        baseEnemy.hp = 3 + stage;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 1;
        baseEnemy.width = 32;
        baseEnemy.height = 32;
        baseEnemy.scoreValue = 300;
        break;

      case 'Zoomer':
        baseEnemy.hp = 2 + stage;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 3;
        baseEnemy.width = 20;
        baseEnemy.height = 20;
        baseEnemy.scoreValue = 200;
        break;

      case 'GroundTurret':
        baseEnemy.hp = 5 + stage * 2;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 0.5;
        baseEnemy.width = 28;
        baseEnemy.height = 28;
        baseEnemy.scoreValue = 500;
        break;

      case 'ItemCarrier':
        baseEnemy.hp = 4 + stage;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 1;
        baseEnemy.width = 32;
        baseEnemy.height = 32;
        baseEnemy.scoreValue = 1000;
        break;

      case 'Hatch':
        baseEnemy.hp = 6 + stage * 2;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 0;
        baseEnemy.y = 50;
        baseEnemy.width = 40;
        baseEnemy.height = 40;
        baseEnemy.scoreValue = 800;
        break;

      case 'RockTurret':
        baseEnemy.hp = 4 + stage;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 0.3;
        baseEnemy.scoreValue = 400;
        break;

      case 'LaserTrap':
        baseEnemy.hp = 3 + stage;
        baseEnemy.maxHp = baseEnemy.hp;
        baseEnemy.vy = 0;
        baseEnemy.y = 80;
        baseEnemy.scoreValue = 600;
        break;

      case 'Debris':
        baseEnemy.hp = 1;
        baseEnemy.maxHp = 1;
        baseEnemy.vy = 2 + Math.random() * 2;
        baseEnemy.vx = (Math.random() - 0.5) * 2;
        baseEnemy.scoreValue = 50;
        break;
    }

    return baseEnemy;
  }

  private updateEnemy(enemy: Enemy, playerX: number, playerY: number, bullets: Bullet[]): void {
    enemy.patternTimer++;

    // 移動パターン
    this.updateMovement(enemy, playerX);

    // 位置更新
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    // 画面外判定
    if (enemy.y > GAME_HEIGHT + 50 || enemy.x < -50 || enemy.x > GAME_WIDTH + 50) {
      enemy.active = false;
      return;
    }

    // 射撃
    enemy.shootTimer++;
    this.updateShooting(enemy, playerX, playerY, bullets);
  }

  private updateMovement(enemy: Enemy, playerX: number): void {
    switch (enemy.type) {
      case 'Spinner':
        enemy.vx = Math.sin(enemy.patternTimer * 0.05) * 2;
        break;

      case 'Zoomer':
        if (enemy.patternTimer % 60 === 0) {
          enemy.vx = (Math.random() - 0.5) * 4;
        }
        break;

      case 'ZakoB':
        // プレイヤーを追尾
        const dx = playerX - enemy.x;
        enemy.vx = Math.sign(dx) * 0.5;
        break;

      case 'Hatch':
        enemy.vx = Math.sin(enemy.patternTimer * 0.02) * 1;
        break;
    }
  }

  private updateShooting(enemy: Enemy, playerX: number, playerY: number, bullets: Bullet[]): void {
    const shootInterval = this.getShootInterval(enemy.type);

    if (enemy.shootTimer >= shootInterval && enemy.y > 0 && enemy.y < GAME_HEIGHT - 100) {
      enemy.shootTimer = 0;

      switch (enemy.type) {
        case 'ZakoA':
          this.shootStraight(enemy, bullets);
          break;

        case 'ZakoB':
        case 'Zoomer':
          this.shootAtPlayer(enemy, playerX, playerY, bullets);
          break;

        case 'Spinner':
          this.shootSpiral(enemy, bullets);
          break;

        case 'GroundTurret':
        case 'RockTurret':
          this.shootSpread(enemy, playerX, playerY, bullets);
          break;

        case 'Hatch':
          this.shootRing(enemy, bullets);
          break;

        case 'LaserTrap':
          this.shootLaser(enemy, bullets);
          break;
      }
    }
  }

  private getShootInterval(type: EnemyType): number {
    switch (type) {
      case 'ZakoA':
        return 90;
      case 'ZakoB':
        return 60;
      case 'Spinner':
        return 20;
      case 'GroundTurret':
        return 45;
      case 'RockTurret':
        return 60;
      case 'Hatch':
        return 120;
      case 'LaserTrap':
        return 180;
      case 'Zoomer':
        return 40;
      default:
        return 120;
    }
  }

  private shootStraight(enemy: Enemy, bullets: Bullet[]): void {
    bullets.push({
      x: enemy.x,
      y: enemy.y + enemy.height / 2,
      width: 6,
      height: 6,
      vx: 0,
      vy: 4,
      damage: 1,
      isPlayerBullet: false,
      active: true,
      color: '#ff6666',
    });
  }

  private shootAtPlayer(enemy: Enemy, playerX: number, playerY: number, bullets: Bullet[]): void {
    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 3;

    bullets.push({
      x: enemy.x,
      y: enemy.y + enemy.height / 2,
      width: 8,
      height: 8,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      damage: 1,
      isPlayerBullet: false,
      active: true,
      color: '#ffaa00',
    });
  }

  private shootSpiral(enemy: Enemy, bullets: Bullet[]): void {
    const angle = enemy.patternTimer * 0.2;
    const speed = 2.5;

    bullets.push({
      x: enemy.x,
      y: enemy.y,
      width: 6,
      height: 6,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: 1,
      isPlayerBullet: false,
      active: true,
      color: '#ff00ff',
    });
  }

  private shootSpread(enemy: Enemy, playerX: number, playerY: number, bullets: Bullet[]): void {
    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;
    const baseAngle = Math.atan2(dy, dx);
    const speed = 3;
    const spreadAngle = 0.2;

    for (let i = -1; i <= 1; i++) {
      const angle = baseAngle + i * spreadAngle;
      bullets.push({
        x: enemy.x,
        y: enemy.y + enemy.height / 2,
        width: 6,
        height: 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: 1,
        isPlayerBullet: false,
        active: true,
        color: '#00ff00',
      });
    }
  }

  private shootRing(enemy: Enemy, bullets: Bullet[]): void {
    const count = 12;
    const speed = 2;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      bullets.push({
        x: enemy.x,
        y: enemy.y,
        width: 8,
        height: 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage: 1,
        isPlayerBullet: false,
        active: true,
        color: '#6666ff',
      });
    }
  }

  private shootLaser(enemy: Enemy, bullets: Bullet[]): void {
    // レーザーは縦に長い弾
    bullets.push({
      x: enemy.x,
      y: enemy.y + 20,
      width: 4,
      height: 60,
      vx: 0,
      vy: 6,
      damage: 2,
      isPlayerBullet: false,
      active: true,
      color: '#00ffff',
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      this.drawEnemy(ctx, enemy);
    }
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    const { x, y, width, height, type } = enemy;

    ctx.save();

    // 敵タイプ別の描画
    switch (type) {
      case 'ZakoA':
        ctx.fillStyle = '#ff4444';
        this.drawTriangle(ctx, x, y, width, false);
        break;

      case 'ZakoB':
        ctx.fillStyle = '#ff8800';
        this.drawDiamond(ctx, x, y, width, height);
        break;

      case 'Spinner':
        ctx.fillStyle = '#ff00ff';
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(enemy.patternTimer * 0.1);
        this.drawStar(ctx, 0, 0, width / 2);
        ctx.restore();
        break;

      case 'Zoomer':
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(x, y, width / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'GroundTurret':
      case 'RockTurret':
        ctx.fillStyle = '#888888';
        ctx.fillRect(x - width / 2, y - height / 2, width, height);
        ctx.fillStyle = '#444444';
        ctx.beginPath();
        ctx.arc(x, y, width / 3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ItemCarrier':
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(x - width / 2, y - height / 2, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', x, y + 4);
        break;

      case 'Hatch':
        ctx.fillStyle = '#666666';
        ctx.fillRect(x - width / 2, y - height / 2, width, height);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - width / 4, y - height / 4, width / 2, height / 2);
        break;

      case 'LaserTrap':
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(x - width / 2, y - 5, width, 10);
        break;

      case 'Debris':
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.moveTo(x, y - height / 2);
        ctx.lineTo(x + width / 2, y);
        ctx.lineTo(x, y + height / 2);
        ctx.lineTo(x - width / 2, y);
        ctx.closePath();
        ctx.fill();
        break;
    }

    // HPバー（大型敵のみ）
    if (enemy.maxHp > 3) {
      const hpRatio = enemy.hp / enemy.maxHp;
      const barWidth = width;
      ctx.fillStyle = '#333333';
      ctx.fillRect(x - barWidth / 2, y - height / 2 - 8, barWidth, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x - barWidth / 2, y - height / 2 - 8, barWidth * hpRatio, 4);
    }

    ctx.restore();
  }

  private drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, up: boolean): void {
    ctx.beginPath();
    if (up) {
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
    } else {
      ctx.moveTo(x, y + size / 2);
      ctx.lineTo(x - size / 2, y - size / 2);
      ctx.lineTo(x + size / 2, y - size / 2);
    }
    ctx.closePath();
    ctx.fill();
  }

  private drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x - w / 2, y);
    ctx.closePath();
    ctx.fill();
  }

  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
}
