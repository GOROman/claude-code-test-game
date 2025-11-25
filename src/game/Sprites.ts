// SVGスプライト管理

export type SpriteType =
  // プレイヤー
  | 'player'
  | 'playerFlame'
  // 敵
  | 'zakoA'
  | 'zakoB'
  | 'spinner'
  | 'zoomer'
  | 'groundTurret'
  | 'itemCarrier'
  | 'hatch'
  | 'laserTrap'
  | 'debris'
  // アイテム
  | 'itemPower'
  | 'itemBomb'
  | 'itemLife'
  | 'itemScore'
  // 弾
  | 'playerBullet'
  | 'enemyBulletSmall'
  | 'enemyBulletMedium'
  | 'enemyBulletLarge'
  // ボス
  | 'bossBody'
  | 'bossCore'
  | 'bossWing';

// SVGスプライト定義
const SVG_SPRITES: Record<SpriteType, string> = {
  // プレイヤー - 緑の戦闘機
  player: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="playerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#00ffaa"/>
        <stop offset="100%" style="stop-color:#008855"/>
      </linearGradient>
    </defs>
    <polygon points="16,2 4,26 16,20 28,26" fill="url(#playerGrad)" stroke="#00ff88" stroke-width="1"/>
    <polygon points="16,8 10,22 16,18 22,22" fill="#005533"/>
    <circle cx="16" cy="14" r="3" fill="#00ffff"/>
  </svg>`,

  // プレイヤーの炎
  playerFlame: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <polygon points="8,0 2,16 8,10 14,16" fill="#ffaa00" opacity="0.9"/>
    <polygon points="8,4 4,16 8,12 12,16" fill="#ffff00"/>
  </svg>`,

  // ZakoA - 赤い三角形の敵
  zakoA: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="zakoAGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#ff6666"/>
        <stop offset="100%" style="stop-color:#aa2222"/>
      </linearGradient>
    </defs>
    <polygon points="12,22 2,4 22,4" fill="url(#zakoAGrad)" stroke="#ff4444" stroke-width="1"/>
    <circle cx="12" cy="10" r="4" fill="#ffaaaa"/>
    <circle cx="12" cy="10" r="2" fill="#ff0000"/>
  </svg>`,

  // ZakoB - オレンジのダイアモンド
  zakoB: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="zakoBGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffaa44"/>
        <stop offset="100%" style="stop-color:#aa5500"/>
      </linearGradient>
    </defs>
    <polygon points="12,2 22,12 12,22 2,12" fill="url(#zakoBGrad)" stroke="#ff8800" stroke-width="1"/>
    <polygon points="12,6 18,12 12,18 6,12" fill="#ffcc88"/>
    <circle cx="12" cy="12" r="3" fill="#ff6600"/>
  </svg>`,

  // Spinner - 紫の星型
  spinner: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff66ff"/>
        <stop offset="100%" style="stop-color:#8800aa"/>
      </linearGradient>
    </defs>
    <polygon points="16,2 19,12 30,12 21,18 24,30 16,22 8,30 11,18 2,12 13,12" fill="url(#spinnerGrad)" stroke="#ff00ff" stroke-width="1"/>
    <circle cx="16" cy="16" r="5" fill="#ffaaff"/>
    <circle cx="16" cy="16" r="2" fill="#ff00ff"/>
  </svg>`,

  // Zoomer - 黄色の円
  zoomer: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <defs>
      <radialGradient id="zoomerGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ffff88"/>
        <stop offset="100%" style="stop-color:#aaaa00"/>
      </radialGradient>
    </defs>
    <circle cx="10" cy="10" r="9" fill="url(#zoomerGrad)" stroke="#ffff00" stroke-width="1"/>
    <circle cx="7" cy="7" r="2" fill="#ffffff" opacity="0.6"/>
  </svg>`,

  // GroundTurret - グレーの砲台
  groundTurret: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <defs>
      <linearGradient id="turretGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#aaaaaa"/>
        <stop offset="100%" style="stop-color:#555555"/>
      </linearGradient>
    </defs>
    <rect x="2" y="8" width="24" height="18" rx="3" fill="url(#turretGrad)" stroke="#888888" stroke-width="1"/>
    <circle cx="14" cy="14" r="6" fill="#333333"/>
    <circle cx="14" cy="14" r="4" fill="#222222"/>
    <rect x="11" y="2" width="6" height="12" rx="2" fill="#666666"/>
  </svg>`,

  // ItemCarrier - 緑のコンテナ
  itemCarrier: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="carrierGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#44ff88"/>
        <stop offset="100%" style="stop-color:#228844"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="4" fill="url(#carrierGrad)" stroke="#00ff88" stroke-width="1"/>
    <text x="16" y="22" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffffff">?</text>
  </svg>`,

  // Hatch - 出撃口
  hatch: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <rect x="2" y="2" width="36" height="36" rx="4" fill="#666666" stroke="#444444" stroke-width="2"/>
    <rect x="8" y="8" width="24" height="24" fill="#000000"/>
    <rect x="12" y="12" width="16" height="16" fill="#111111"/>
    <circle cx="20" cy="20" r="4" fill="#333333"/>
  </svg>`,

  // LaserTrap - レーザー砲
  laserTrap: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
    <defs>
      <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#00aaff"/>
        <stop offset="50%" style="stop-color:#00ffff"/>
        <stop offset="100%" style="stop-color:#00aaff"/>
      </linearGradient>
    </defs>
    <rect x="0" y="4" width="24" height="8" rx="2" fill="url(#laserGrad)" stroke="#0088ff" stroke-width="1"/>
    <circle cx="12" cy="8" r="3" fill="#ffffff"/>
  </svg>`,

  // Debris - 破片
  debris: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <polygon points="12,2 20,8 18,18 6,20 4,10" fill="#888888" stroke="#aaaaaa" stroke-width="1"/>
    <polygon points="12,6 16,10 14,16 8,14 8,8" fill="#666666"/>
  </svg>`,

  // アイテム - パワーアップ
  itemPower: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <radialGradient id="powerGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ff6666"/>
        <stop offset="100%" style="stop-color:#cc0000"/>
      </radialGradient>
    </defs>
    <circle cx="8" cy="8" r="7" fill="url(#powerGrad)" stroke="#ff0000" stroke-width="1"/>
    <text x="8" y="12" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">P</text>
  </svg>`,

  // アイテム - ボム
  itemBomb: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <radialGradient id="bombGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#66ff66"/>
        <stop offset="100%" style="stop-color:#00aa00"/>
      </radialGradient>
    </defs>
    <circle cx="8" cy="8" r="7" fill="url(#bombGrad)" stroke="#00ff00" stroke-width="1"/>
    <text x="8" y="12" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">B</text>
  </svg>`,

  // アイテム - 1UP
  itemLife: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <radialGradient id="lifeGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ff66ff"/>
        <stop offset="100%" style="stop-color:#aa00aa"/>
      </radialGradient>
    </defs>
    <circle cx="8" cy="8" r="7" fill="url(#lifeGrad)" stroke="#ff00ff" stroke-width="1"/>
    <text x="8" y="11" text-anchor="middle" font-size="7" font-weight="bold" fill="#ffffff">1UP</text>
  </svg>`,

  // アイテム - スコア
  itemScore: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <defs>
      <radialGradient id="scoreGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ffff66"/>
        <stop offset="100%" style="stop-color:#aaaa00"/>
      </radialGradient>
    </defs>
    <circle cx="8" cy="8" r="7" fill="url(#scoreGrad)" stroke="#ffff00" stroke-width="1"/>
    <text x="8" y="12" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">$</text>
  </svg>`,

  // プレイヤー弾
  playerBullet: `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="12" viewBox="0 0 4 12">
    <defs>
      <linearGradient id="pBulletGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#00ffff"/>
        <stop offset="100%" style="stop-color:#0088aa"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="4" height="12" rx="2" fill="url(#pBulletGrad)"/>
  </svg>`,

  // 敵弾 - 小
  enemyBulletSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
    <defs>
      <radialGradient id="eBulletSmallGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ffaaaa"/>
        <stop offset="100%" style="stop-color:#ff4444"/>
      </radialGradient>
    </defs>
    <circle cx="4" cy="4" r="3.5" fill="url(#eBulletSmallGrad)" stroke="#ff6666" stroke-width="0.5"/>
  </svg>`,

  // 敵弾 - 中
  enemyBulletMedium: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
    <defs>
      <radialGradient id="eBulletMedGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ffcc88"/>
        <stop offset="100%" style="stop-color:#ff8800"/>
      </radialGradient>
    </defs>
    <circle cx="6" cy="6" r="5" fill="url(#eBulletMedGrad)" stroke="#ffaa00" stroke-width="1"/>
    <circle cx="4" cy="4" r="1.5" fill="#ffffff" opacity="0.5"/>
  </svg>`,

  // 敵弾 - 大
  enemyBulletLarge: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <defs>
      <radialGradient id="eBulletLargeGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ff6666"/>
        <stop offset="100%" style="stop-color:#aa0000"/>
      </radialGradient>
    </defs>
    <circle cx="10" cy="10" r="9" fill="url(#eBulletLargeGrad)" stroke="#ff0000" stroke-width="1"/>
    <circle cx="10" cy="10" r="5" fill="#ff4444" opacity="0.7"/>
    <circle cx="6" cy="6" r="2" fill="#ffffff" opacity="0.5"/>
  </svg>`,

  // ボス本体
  bossBody: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80" viewBox="0 0 100 80">
    <defs>
      <linearGradient id="bossBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#aa4444"/>
        <stop offset="100%" style="stop-color:#440000"/>
      </linearGradient>
    </defs>
    <polygon points="50,5 90,35 80,75 20,75 10,35" fill="url(#bossBodyGrad)" stroke="#ff4444" stroke-width="2"/>
    <polygon points="50,15 75,35 70,65 30,65 25,35" fill="#660000"/>
  </svg>`,

  // ボスコア
  bossCore: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <defs>
      <radialGradient id="bossCoreGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ffaaaa"/>
        <stop offset="50%" style="stop-color:#ff4444"/>
        <stop offset="100%" style="stop-color:#aa0000"/>
      </radialGradient>
    </defs>
    <circle cx="20" cy="20" r="18" fill="url(#bossCoreGrad)" stroke="#ff6666" stroke-width="2"/>
    <circle cx="20" cy="20" r="10" fill="#ff8888" opacity="0.6"/>
    <circle cx="14" cy="14" r="4" fill="#ffffff" opacity="0.4"/>
  </svg>`,

  // ボスウイング
  bossWing: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="50" viewBox="0 0 30 50">
    <defs>
      <linearGradient id="bossWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#aa4444"/>
        <stop offset="100%" style="stop-color:#440000"/>
      </linearGradient>
    </defs>
    <polygon points="5,10 25,0 20,50 0,40" fill="url(#bossWingGrad)" stroke="#ff4444" stroke-width="1"/>
  </svg>`,
};

// スプライトキャッシュ
const spriteCache: Map<SpriteType, HTMLImageElement> = new Map();
const coloredSpriteCache: Map<string, HTMLImageElement> = new Map();

// SVGをImageに変換
function svgToImage(svg: string): HTMLImageElement {
  const img = new Image();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  img.src = URL.createObjectURL(blob);
  return img;
}

// スプライトをロード
export function loadSprite(type: SpriteType): HTMLImageElement {
  let sprite = spriteCache.get(type);
  if (!sprite) {
    sprite = svgToImage(SVG_SPRITES[type]);
    spriteCache.set(type, sprite);
  }
  return sprite;
}

// 色付きスプライトを生成（ボスなど色が変わるもの用）
export function loadColoredSprite(type: SpriteType, color: string): HTMLImageElement {
  const key = `${type}-${color}`;
  let sprite = coloredSpriteCache.get(key);
  if (!sprite) {
    let svg = SVG_SPRITES[type];
    // グラデーションの色を置換
    svg = svg.replace(/#aa4444/g, color);
    svg = svg.replace(/#440000/g, darkenColor(color, 0.5));
    svg = svg.replace(/#660000/g, darkenColor(color, 0.3));
    svg = svg.replace(/#ff4444/g, lightenColor(color, 0.3));
    sprite = svgToImage(svg);
    coloredSpriteCache.set(key, sprite);
  }
  return sprite;
}

// 色を暗くする
function darkenColor(hex: string, amount: number): string {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * (1 - amount));
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * (1 - amount));
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * (1 - amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 色を明るくする
function lightenColor(hex: string, amount: number): string {
  const r = Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * (1 + amount)));
  const g = Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * (1 + amount)));
  const b = Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * (1 + amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// すべてのスプライトを事前ロード
export function preloadAllSprites(): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const type of Object.keys(SVG_SPRITES) as SpriteType[]) {
    const img = loadSprite(type);
    promises.push(
      new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // エラーでも続行
        }
      })
    );
  }

  return Promise.all(promises).then(() => {});
}

// スプライト描画ヘルパー
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  type: SpriteType,
  x: number,
  y: number,
  width?: number,
  height?: number,
  rotation?: number
): void {
  const sprite = loadSprite(type);
  if (!sprite.complete) return;

  const w = width ?? sprite.width;
  const h = height ?? sprite.height;

  ctx.save();
  ctx.translate(x, y);

  if (rotation) {
    ctx.rotate(rotation);
  }

  ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// 色付きスプライト描画ヘルパー
export function drawColoredSprite(
  ctx: CanvasRenderingContext2D,
  type: SpriteType,
  color: string,
  x: number,
  y: number,
  width?: number,
  height?: number,
  rotation?: number
): void {
  const sprite = loadColoredSprite(type, color);
  if (!sprite.complete) return;

  const w = width ?? sprite.width;
  const h = height ?? sprite.height;

  ctx.save();
  ctx.translate(x, y);

  if (rotation) {
    ctx.rotate(rotation);
  }

  ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
  ctx.restore();
}
