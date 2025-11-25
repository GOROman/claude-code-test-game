// 入力ハンドリング（キーボード、ゲームパッド、タッチ）

import type { InputState } from './types';

export class InputManager {
  private keys: Set<string> = new Set();
  private gamepadIndex: number | null = null;
  private touchState: InputState = this.getEmptyState();

  constructor() {
    this.setupKeyboard();
    this.setupGamepad();
  }

  private getEmptyState(): InputState {
    return {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      bomb: false,
      focus: false,
      start: false,
    };
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      // ゲーム中のブラウザスクロール防止
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  private setupGamepad(): void {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index;
      console.log('Gamepad connected:', e.gamepad.id);
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadIndex = null;
      console.log('Gamepad disconnected');
    });
  }

  // タッチ入力の更新（外部から呼び出し）
  setTouchState(state: Partial<InputState>): void {
    this.touchState = { ...this.touchState, ...state };
  }

  getState(): InputState {
    const keyboard = this.getKeyboardState();
    const gamepad = this.getGamepadState();

    // 全ての入力ソースをマージ
    return {
      up: keyboard.up || gamepad.up || this.touchState.up,
      down: keyboard.down || gamepad.down || this.touchState.down,
      left: keyboard.left || gamepad.left || this.touchState.left,
      right: keyboard.right || gamepad.right || this.touchState.right,
      shoot: keyboard.shoot || gamepad.shoot || this.touchState.shoot,
      bomb: keyboard.bomb || gamepad.bomb || this.touchState.bomb,
      focus: keyboard.focus || gamepad.focus || this.touchState.focus,
      start: keyboard.start || gamepad.start || this.touchState.start,
    };
  }

  private getKeyboardState(): InputState {
    return {
      up: this.keys.has('ArrowUp') || this.keys.has('KeyW'),
      down: this.keys.has('ArrowDown') || this.keys.has('KeyS'),
      left: this.keys.has('ArrowLeft') || this.keys.has('KeyA'),
      right: this.keys.has('ArrowRight') || this.keys.has('KeyD'),
      shoot: this.keys.has('KeyZ') || this.keys.has('Space'),
      bomb: this.keys.has('KeyX'),
      focus: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'),
      start: this.keys.has('Enter') || this.keys.has('Escape'),
    };
  }

  private getGamepadState(): InputState {
    if (this.gamepadIndex === null) {
      return this.getEmptyState();
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];

    if (!gamepad) {
      return this.getEmptyState();
    }

    const deadzone = 0.3;

    return {
      up: gamepad.axes[1] < -deadzone || gamepad.buttons[12]?.pressed,
      down: gamepad.axes[1] > deadzone || gamepad.buttons[13]?.pressed,
      left: gamepad.axes[0] < -deadzone || gamepad.buttons[14]?.pressed,
      right: gamepad.axes[0] > deadzone || gamepad.buttons[15]?.pressed,
      shoot: gamepad.buttons[0]?.pressed || gamepad.buttons[2]?.pressed,
      bomb: gamepad.buttons[1]?.pressed || gamepad.buttons[3]?.pressed,
      focus: gamepad.buttons[4]?.pressed || gamepad.buttons[5]?.pressed,
      start: gamepad.buttons[9]?.pressed,
    };
  }
}
