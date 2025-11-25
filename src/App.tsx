import { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from './game/Game';
import type { Difficulty, InputState } from './game/types';
import { GAME_WIDTH, GAME_HEIGHT } from './game/types';
import './App.css';

type GameScreen = 'title' | 'game';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [screen, setScreen] = useState<GameScreen>('title');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [isMobile, setIsMobile] = useState(false);

  // タッチ状態の管理
  const touchStateRef = useRef<Partial<InputState>>({});

  useEffect(() => {
    // モバイル判定
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (screen === 'game' && canvasRef.current && !gameRef.current) {
      gameRef.current = new Game(canvasRef.current);
      gameRef.current.setDifficulty(difficulty);
      gameRef.current.start();
    }

    return () => {
      // クリーンアップ
    };
  }, [screen, difficulty]);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    gameRef.current = null;
    setScreen('game');
  }, []);

  const backToTitle = useCallback(() => {
    gameRef.current = null;
    setScreen('title');
  }, []);

  // タッチハンドラー
  const handleTouchStart = useCallback((direction: keyof InputState) => {
    touchStateRef.current[direction] = true;
    gameRef.current?.setTouchInput(touchStateRef.current);
  }, []);

  const handleTouchEnd = useCallback((direction: keyof InputState) => {
    touchStateRef.current[direction] = false;
    gameRef.current?.setTouchInput(touchStateRef.current);
  }, []);

  if (screen === 'title') {
    return (
      <div className="title-screen">
        <div className="title-container">
          <h1 className="game-title">GRASS HARLEY</h1>
          <p className="subtitle">- 1987 ARCADE STYLE SHOOTER -</p>

          <div className="menu">
            <button
              className="menu-button normal"
              onClick={() => startGame('NORMAL')}
            >
              NORMAL MODE
            </button>
            <button
              className="menu-button hard"
              onClick={() => startGame('HARD')}
            >
              HARD MODE
            </button>
          </div>

          <div className="controls-info">
            <h3>CONTROLS</h3>
            <div className="control-list">
              <p><span className="key">Arrow Keys / WASD</span> Move</p>
              <p><span className="key">Z / Space</span> Shoot</p>
              <p><span className="key">X</span> Bomb</p>
              <p><span className="key">Shift</span> Focus (slow move)</p>
              <p><span className="key">Enter / ESC</span> Pause</p>
            </div>
            {isMobile && (
              <p className="mobile-hint">Touch controls available on mobile</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="game-canvas"
        />

        {isMobile && (
          <div className="touch-controls">
            <div className="dpad">
              <button
                className="dpad-button up"
                onTouchStart={() => handleTouchStart('up')}
                onTouchEnd={() => handleTouchEnd('up')}
              >
                ▲
              </button>
              <div className="dpad-row">
                <button
                  className="dpad-button left"
                  onTouchStart={() => handleTouchStart('left')}
                  onTouchEnd={() => handleTouchEnd('left')}
                >
                  ◀
                </button>
                <button
                  className="dpad-button focus"
                  onTouchStart={() => handleTouchStart('focus')}
                  onTouchEnd={() => handleTouchEnd('focus')}
                >
                  ●
                </button>
                <button
                  className="dpad-button right"
                  onTouchStart={() => handleTouchStart('right')}
                  onTouchEnd={() => handleTouchEnd('right')}
                >
                  ▶
                </button>
              </div>
              <button
                className="dpad-button down"
                onTouchStart={() => handleTouchStart('down')}
                onTouchEnd={() => handleTouchEnd('down')}
              >
                ▼
              </button>
            </div>

            <div className="action-buttons">
              <button
                className="action-button shoot"
                onTouchStart={() => handleTouchStart('shoot')}
                onTouchEnd={() => handleTouchEnd('shoot')}
              >
                SHOT
              </button>
              <button
                className="action-button bomb"
                onTouchStart={() => handleTouchStart('bomb')}
                onTouchEnd={() => handleTouchEnd('bomb')}
              >
                BOMB
              </button>
            </div>
          </div>
        )}

        <button className="back-button" onClick={backToTitle}>
          ← TITLE
        </button>
      </div>
    </div>
  );
}

export default App;
