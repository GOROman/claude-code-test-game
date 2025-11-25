// メインゲームエンジン

import type { GameState, Bullet, Item, Explosion, Difficulty } from './types';
import { GAME_WIDTH, GAME_HEIGHT } from './types';
import { InputManager } from './Input';
import { Player } from './Player';
import { EnemyManager } from './Enemy';
import { BossManager } from './Boss';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  private player: Player;
  private enemyManager: EnemyManager;
  private bossManager: BossManager;

  private bullets: Bullet[] = [];
  private items: Item[] = [];
  private explosions: Explosion[] = [];

  private state: GameState;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly FRAME_TIME = 1000 / 60;

  private stageTimer: number = 0;
  private readonly STAGE_DURATION = 60 * 60; // 60秒
  private bossSpawned: boolean = false;
  private bombActive: boolean = false;
  private bombTimer: number = 0;

  private backgroundStars: { x: number; y: number; speed: number; size: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputManager();
    this.player = new Player();
    this.enemyManager = new EnemyManager();
    this.bossManager = new BossManager();

    this.state = this.createInitialState();

    this.initBackground();
    this.loadHighScore();
  }

  private createInitialState(): GameState {
    return {
      stage: 1,
      difficulty: 'NORMAL',
      paused: false,
      gameOver: false,
      stageClear: false,
      highScore: 0,
      scrollY: 0,
    };
  }

  private initBackground(): void {
    this.backgroundStars = [];
    for (let i = 0; i < 100; i++) {
      this.backgroundStars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        speed: 0.5 + Math.random() * 2,
        size: 1,
      });
    }
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('grassHarleyHighScore');
    if (saved) {
      this.state.highScore = parseInt(saved, 10);
    }
  }

  private saveHighScore(): void {
    if (this.player.state.score > this.state.highScore) {
      this.state.highScore = this.player.state.score;
      localStorage.setItem('grassHarleyHighScore', this.state.highScore.toString());
    }
  }

  setDifficulty(difficulty: Difficulty): void {
    this.state.difficulty = difficulty;
    this.bossManager.setDifficulty(difficulty);
  }

  start(): void {
    this.reset();
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  reset(): void {
    this.player.reset();
    this.enemyManager.reset();
    this.bossManager.reset();
    this.bullets = [];
    this.items = [];
    this.explosions = [];
    this.state.stage = 1;
    this.state.paused = false;
    this.state.gameOver = false;
    this.state.stageClear = false;
    this.stageTimer = 0;
    this.bossSpawned = false;
    this.bombActive = false;
    this.bombTimer = 0;
    this.frameCount = 0;
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    // 固定タイムステップ
    while (this.accumulator >= this.FRAME_TIME) {
      this.update();
      this.accumulator -= this.FRAME_TIME;
    }

    this.draw();

    requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    const inputState = this.input.getState();

    // ポーズ切り替え
    if (inputState.start && this.frameCount % 10 === 0) {
      if (this.state.gameOver || this.state.stageClear) {
        if (this.state.stageClear) {
          this.nextStage();
        } else {
          this.reset();
        }
      } else {
        this.state.paused = !this.state.paused;
      }
    }

    if (this.state.paused || this.state.gameOver || this.state.stageClear) {
      this.frameCount++;
      return;
    }

    // 背景スクロール
    this.updateBackground();

    // ステージ進行
    this.stageTimer++;

    // プレイヤー更新
    this.player.update(inputState, this.bullets);

    // ボム使用
    if (inputState.bomb && this.player.useBomb()) {
      this.activateBomb();
    }

    // ボム更新
    if (this.bombActive) {
      this.updateBomb();
    }

    // ボス出現チェック
    if (!this.bossSpawned && this.stageTimer >= this.STAGE_DURATION) {
      this.bossManager.spawn(this.state.stage);
      this.bossSpawned = true;
      this.enemyManager.reset(); // 通常敵をクリア
    }

    // 敵更新
    if (!this.bossSpawned) {
      this.enemyManager.update(
        this.player.state.x,
        this.player.state.y,
        this.bullets,
        this.state.stage
      );
    }

    // ボス更新
    if (this.bossSpawned) {
      this.bossManager.update(this.player.state.x, this.player.state.y, this.bullets);
    }

    // 弾更新
    this.updateBullets();

    // アイテム更新
    this.updateItems();

    // 爆発更新
    this.updateExplosions();

    // 衝突判定
    this.checkCollisions();

    // ゲームオーバーチェック
    if (!this.player.state.active && this.player.state.lives <= 0) {
      this.state.gameOver = true;
      this.saveHighScore();
    }

    // ステージクリアチェック
    if (this.bossManager.boss?.defeated) {
      this.player.addScore(this.bossManager.getScoreValue());
      this.state.stageClear = true;
      this.saveHighScore();
    }

    this.frameCount++;
  }

  private updateBackground(): void {
    for (const star of this.backgroundStars) {
      star.y += star.speed;
      if (star.y > GAME_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * GAME_WIDTH;
      }
    }
  }

  private activateBomb(): void {
    this.bombActive = true;
    this.bombTimer = 60;

    // 画面上の敵弾を消去
    this.bullets = this.bullets.filter((b) => b.isPlayerBullet);

    // 敵にダメージ
    for (const enemy of this.enemyManager.enemies) {
      enemy.hp -= 10;
      if (enemy.hp <= 0) {
        this.createExplosion(enemy.x, enemy.y);
        this.player.addScore(enemy.scoreValue);
        this.spawnItem(enemy.x, enemy.y, enemy.type === 'ItemCarrier');
        enemy.active = false;
      }
    }

    // ボスにもダメージ
    if (this.bossManager.boss?.active) {
      this.bossManager.takeDamage(20);
    }
  }

  private updateBomb(): void {
    this.bombTimer--;
    if (this.bombTimer <= 0) {
      this.bombActive = false;
    }
  }

  private updateBullets(): void {
    for (const bullet of this.bullets) {
      if (!bullet.active) continue;

      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      // 画面外判定
      if (
        bullet.x < -20 ||
        bullet.x > GAME_WIDTH + 20 ||
        bullet.y < -20 ||
        bullet.y > GAME_HEIGHT + 20
      ) {
        bullet.active = false;
      }
    }

    this.bullets = this.bullets.filter((b) => b.active);
  }

  private updateItems(): void {
    for (const item of this.items) {
      if (!item.active) continue;

      item.y += item.vy;

      if (item.y > GAME_HEIGHT + 20) {
        item.active = false;
      }
    }

    this.items = this.items.filter((i) => i.active);
  }

  private updateExplosions(): void {
    for (const explosion of this.explosions) {
      explosion.timer--;
      if (explosion.timer <= 0) {
        explosion.active = false;
      }
    }

    this.explosions = this.explosions.filter((e) => e.active);
  }

  private checkCollisions(): void {
    const player = this.player.state;

    // プレイヤー弾 vs 敵
    for (const bullet of this.bullets) {
      if (!bullet.active || !bullet.isPlayerBullet) continue;

      // vs 通常敵
      for (const enemy of this.enemyManager.enemies) {
        if (!enemy.active) continue;

        if (this.checkHit(bullet, enemy)) {
          bullet.active = false;
          enemy.hp -= bullet.damage;

          if (enemy.hp <= 0) {
            this.createExplosion(enemy.x, enemy.y);
            this.player.addScore(enemy.scoreValue);
            this.spawnItem(enemy.x, enemy.y, enemy.type === 'ItemCarrier');
            enemy.active = false;
          }
        }
      }

      // vs ボス
      if (this.bossManager.boss?.active) {
        if (this.checkHit(bullet, this.bossManager.boss)) {
          bullet.active = false;
          this.bossManager.takeDamage(bullet.damage);
        }
      }
    }

    // 敵弾 vs プレイヤー
    if (player.active && !player.invincible) {
      for (const bullet of this.bullets) {
        if (!bullet.active || bullet.isPlayerBullet) continue;

        if (this.checkHitPlayer(bullet, player)) {
          bullet.active = false;
          this.createExplosion(player.x, player.y);
          if (this.player.hit()) {
            // ゲームオーバー
          }
        }
      }
    }

    // 敵 vs プレイヤー（体当たり）
    if (player.active && !player.invincible) {
      for (const enemy of this.enemyManager.enemies) {
        if (!enemy.active) continue;

        if (this.checkHitPlayer(enemy, player)) {
          this.createExplosion(player.x, player.y);
          if (this.player.hit()) {
            // ゲームオーバー
          }
        }
      }

      // ボス本体との衝突
      if (this.bossManager.boss?.active) {
        if (this.checkHitPlayer(this.bossManager.boss, player)) {
          this.createExplosion(player.x, player.y);
          if (this.player.hit()) {
            // ゲームオーバー
          }
        }
      }
    }

    // アイテム vs プレイヤー
    for (const item of this.items) {
      if (!item.active) continue;

      if (this.checkHitPlayer(item, player)) {
        item.active = false;
        this.collectItem(item);
      }
    }
  }

  private checkHit(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean {
    return (
      Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
      Math.abs(a.y - b.y) < (a.height + b.height) / 2
    );
  }

  private checkHitPlayer(obj: { x: number; y: number; width: number; height: number }, player: { x: number; y: number; width: number; height: number }): boolean {
    // プレイヤーの当たり判定は小さめ
    const hitRadius = player.width / 2;
    const objRadius = Math.max(obj.width, obj.height) / 2;

    const dx = obj.x - player.x;
    const dy = obj.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist < hitRadius + objRadius;
  }

  private createExplosion(x: number, y: number): void {
    this.explosions.push({
      x,
      y,
      width: 40,
      height: 40,
      active: true,
      timer: 20,
      maxTimer: 20,
      radius: 20,
    });
  }

  private spawnItem(x: number, y: number, guaranteed: boolean): void {
    // アイテムドロップ確率
    if (!guaranteed && Math.random() > 0.15) return;

    const types: Item['type'][] = ['power', 'bomb', 'life', 'score'];
    const weights = [0.4, 0.25, 0.05, 0.3];

    let rand = Math.random();
    let type: Item['type'] = 'power';

    for (let i = 0; i < types.length; i++) {
      rand -= weights[i];
      if (rand <= 0) {
        type = types[i];
        break;
      }
    }

    this.items.push({
      x,
      y,
      width: 16,
      height: 16,
      active: true,
      type,
      vy: 1.5,
    });
  }

  private collectItem(item: Item): void {
    switch (item.type) {
      case 'power':
        this.player.powerUp();
        break;
      case 'bomb':
        this.player.addBomb();
        break;
      case 'life':
        this.player.addLife();
        break;
      case 'score':
        this.player.addScore(500);
        break;
    }
  }

  private nextStage(): void {
    if (this.state.stage >= 5) {
      // 全ステージクリア！
      this.state.gameOver = true;
      this.saveHighScore();
      return;
    }

    this.state.stage++;
    this.state.stageClear = false;
    this.stageTimer = 0;
    this.bossSpawned = false;
    this.bossManager.reset();
    this.enemyManager.reset();
    this.bullets = [];
  }

  private draw(): void {
    const ctx = this.ctx;

    // 背景
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 星
    this.drawBackground();

    // ボム演出
    if (this.bombActive) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.bombTimer / 60 * 0.5})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // ゲームオブジェクト描画
    this.drawBullets();
    this.drawItems();
    this.enemyManager.draw(ctx);
    this.bossManager.draw(ctx);
    this.player.draw(ctx);
    this.drawExplosions();

    // UI
    this.drawUI();

    // ポーズ・ゲームオーバー・クリア画面
    if (this.state.paused) {
      this.drawPauseScreen();
    } else if (this.state.gameOver) {
      this.drawGameOverScreen();
    } else if (this.state.stageClear) {
      this.drawStageClearScreen();
    }
  }

  private drawBackground(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';

    for (const star of this.backgroundStars) {
      ctx.globalAlpha = 0.5 + star.speed / 4;
      ctx.fillRect(star.x, star.y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  private drawBullets(): void {
    const ctx = this.ctx;

    for (const bullet of this.bullets) {
      if (!bullet.active) continue;

      ctx.fillStyle = bullet.color;

      if (bullet.isPlayerBullet) {
        // プレイヤー弾は細長い
        ctx.fillRect(
          bullet.x - bullet.width / 2,
          bullet.y - bullet.height / 2,
          bullet.width,
          bullet.height
        );
      } else {
        // 敵弾は丸い
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawItems(): void {
    const ctx = this.ctx;

    for (const item of this.items) {
      if (!item.active) continue;

      const colors = {
        power: '#ff0000',
        bomb: '#00ff00',
        life: '#ff00ff',
        score: '#ffff00',
      };

      const labels = {
        power: 'P',
        bomb: 'B',
        life: '1UP',
        score: '$',
      };

      ctx.fillStyle = colors[item.type];
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.width / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[item.type], item.x, item.y);
    }
  }

  private drawExplosions(): void {
    const ctx = this.ctx;

    for (const explosion of this.explosions) {
      if (!explosion.active) continue;

      const progress = 1 - explosion.timer / explosion.maxTimer;
      const radius = explosion.radius * (1 + progress);
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha;

      // 外円
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // 内円
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // コア
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  }

  private drawUI(): void {
    const ctx = this.ctx;
    const player = this.player.state;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    // スコア
    ctx.fillText(`SCORE: ${player.score.toString().padStart(8, '0')}`, 10, 20);

    // ハイスコア
    ctx.textAlign = 'center';
    ctx.fillText(`HI: ${this.state.highScore.toString().padStart(8, '0')}`, GAME_WIDTH / 2, 20);

    // 残機とボム
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00ff88';
    ctx.fillText(`LIFE: ${player.lives}`, GAME_WIDTH - 80, 20);
    ctx.fillStyle = '#00aaff';
    ctx.fillText(`BOMB: ${player.bombs}`, GAME_WIDTH - 10, 20);

    // ステージ
    ctx.fillStyle = '#ffff00';
    ctx.textAlign = 'left';
    ctx.fillText(`STAGE ${this.state.stage}`, 10, GAME_HEIGHT - 10);

    // 難易度
    ctx.fillStyle = this.state.difficulty === 'HARD' ? '#ff4444' : '#88ff88';
    ctx.textAlign = 'right';
    ctx.fillText(this.state.difficulty, GAME_WIDTH - 10, GAME_HEIGHT - 10);

    // パワーレベル
    ctx.fillStyle = '#ff8800';
    ctx.textAlign = 'center';
    ctx.fillText(`POWER: ${'*'.repeat(player.powerLevel)}${'_'.repeat(3 - player.powerLevel)}`, GAME_WIDTH / 2, GAME_HEIGHT - 10);
  }

  private drawPauseScreen(): void {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2);

    ctx.font = '16px monospace';
    ctx.fillText('Press ENTER to continue', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
  }

  private drawGameOverScreen(): void {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText(`FINAL SCORE: ${this.player.state.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);

    if (this.player.state.score >= this.state.highScore) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText('NEW HIGH SCORE!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    }

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px monospace';
    ctx.fillText('Press ENTER to restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
  }

  private drawStageClearScreen(): void {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 50, 0.8)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STAGE CLEAR!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText(`STAGE ${this.state.stage} COMPLETED`, GAME_WIDTH / 2, GAME_HEIGHT / 2);

    ctx.fillStyle = '#ffff00';
    ctx.fillText(`SCORE: ${this.player.state.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);

    if (this.state.stage < 5) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '14px monospace';
      ctx.fillText('Press ENTER for next stage', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70);
    } else {
      ctx.fillStyle = '#ff00ff';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('CONGRATULATIONS!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70);
      ctx.font = '14px monospace';
      ctx.fillText('You have completed all stages!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
    }
  }

  // タッチ入力用のメソッド
  setTouchInput(state: Partial<import('./types').InputState>): void {
    this.input.setTouchState(state);
  }
}
