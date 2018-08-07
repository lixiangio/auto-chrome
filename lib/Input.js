const { assert, sleep } = require('./helper');
const keyDefinitions = require('./USKeyboardLayout');


class Keyboard {
  /**
   * @param {Function} send
   */
  constructor(send) {
    this.send = send;
    this._modifiers = 0;
    this._pressedKeys = new Set();
  }

  /**
   * @param {string} key
   * @param {{text: string}=} options
   */
  async down(key, options = { text: undefined }) {
    const description = this._keyDescriptionForString(key);

    const autoRepeat = this._pressedKeys.has(description.code);
    this._pressedKeys.add(description.code);
    this._modifiers |= this._modifierBit(description.key);

    const text = options.text === undefined ? description.text : options.text;
    await this.send('Input.dispatchKeyEvent', {
      type: text ? 'keyDown' : 'rawKeyDown',
      modifiers: this._modifiers,
      windowsVirtualKeyCode: description.keyCode,
      code: description.code,
      key: description.key,
      text: text,
      unmodifiedText: text,
      autoRepeat,
      location: description.location,
      isKeypad: description.location === 3
    });
  }

  /**
   * @param {string} key
   * @return {number}
   */
  _modifierBit(key) {
    if (key === 'Alt')
      return 1;
    if (key === 'Control')
      return 2;
    if (key === 'Meta')
      return 4;
    if (key === 'Shift')
      return 8;
    return 0;
  }

  /**
   * @param {string} keyString
   * @return {KeyDescription}
   */
  _keyDescriptionForString(keyString) {
    const shift = this._modifiers & 8;
    const description = {
      key: '',
      keyCode: 0,
      code: '',
      text: '',
      location: 0
    };

    const definition = keyDefinitions[keyString];
    assert(definition, `Unknown key: "${keyString}"`);

    if (definition.key)
      description.key = definition.key;
    if (shift && definition.shiftKey)
      description.key = definition.shiftKey;

    if (definition.keyCode)
      description.keyCode = definition.keyCode;
    if (shift && definition.shiftKeyCode)
      description.keyCode = definition.shiftKeyCode;

    if (definition.code)
      description.code = definition.code;

    if (definition.location)
      description.location = definition.location;

    if (description.key.length === 1)
      description.text = description.key;

    if (definition.text)
      description.text = definition.text;
    if (shift && definition.shiftText)
      description.text = definition.shiftText;

    // if any modifiers besides shift are pressed, no text should be sent
    if (this._modifiers & ~8)
      description.text = '';

    return description;
  }

  /**
   * @param {string} key
   */
  async up(key) {
    const description = this._keyDescriptionForString(key);

    this._modifiers &= ~this._modifierBit(description.key);
    this._pressedKeys.delete(description.code);
    await this.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      modifiers: this._modifiers,
      key: description.key,
      windowsVirtualKeyCode: description.keyCode,
      code: description.code,
      location: description.location
    });
  }

  /**
   * @param {string} char
   */
  async sendCharacter(char) {
    await this.send('Input.dispatchKeyEvent', {
      type: 'char',
      modifiers: this._modifiers,
      text: char,
      key: char,
      unmodifiedText: char
    });
  }

  /**
   * @param {string} text
   * @param {{delay: (number|undefined)}=} options
   */
  async type(text, options) {
    let delay = 0;
    if (options && options.delay)
      delay = options.delay;
    for (const char of text) {
      if (keyDefinitions[char])
        await this.press(char, { delay });
      else
        await this.sendCharacter(char);
      if (delay)
        await new Promise(f => setTimeout(f, delay));
    }
  }

  /**
   * @param {string} key
   * @param {!Object=} options
   */
  async press(key, options) {
    await this.down(key, options);
    if (options && options.delay)
      await new Promise(f => setTimeout(f, options.delay));
    await this.up(key);
  }
}

class Mouse {
  /**
   * @param {Function} send
   */
  constructor(send) {
    this.send = send;
    this._x = 0;
    this._y = 0;
    this._button = 'none';
  }

  /**
   * 将steps默认值改为20，原值是1
   * @param {number} x
   * @param {number} y
   * @param {Object=} options
   * @return {!Promise}
   */
  async move(x, y, options = {}) {
    const fromX = this._x, fromY = this._y;
    this._x = x;
    this._y = y;
    let { steps = 20 } = options
    for (let i = 1; i <= steps; i++) {
      await this.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        button: this._button,
        x: fromX + (this._x - fromX) * (i / steps),
        y: fromY + (this._y - fromY) * (i / steps)
      });
    }
  }
  /**
   * 
   * @param {number} x
   * @param {number} y
   * @param {!Object=} options
   */
  async click(x, y, options = {}) {
    await this.move(x, y, options);
    await this.down(options);
    if (typeof options.delay === 'number')
      await new Promise(f => setTimeout(f, options.delay));
    await this.up(options);
  }

  /**
   * @param {!Object=} options
   */
  async down(options = {}) {
    this._button = (options.button || 'left');
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      button: this._button,
      x: this._x,
      y: this._y,
      clickCount: (options.clickCount || 1)
    });
  }

  /**
   * @param {!Object=} options
   */
  async up(options = {}) {
    this._button = 'none';
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      button: (options.button || 'left'),
      x: this._x,
      y: this._y,
      clickCount: (options.clickCount || 1)
    });
  }

  /**
   * 新增 相对于窗口可视区滚动至指定坐标，目前仅支持纵向滚动
   * @param {number} x 相对于窗口的横向偏移量
   * @param {number} y 相对于窗口的纵向偏移量
   */
  async scroll(x = 0, y = 0, step = 20) {

    if (y < 0) step = -step
    let count = y / step
    for (let i = 0; i <= count; i++) {
      await this.send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: this._x,
        y: this._y, // 鼠标在屏幕上的坐标
        deltaX: 0,
        deltaY: step // 滚动距离
      });
      await sleep(20);
    }

    // 滚动后需要短暂停留，以消除惯性
    await sleep(1000)

  }
}

class Touchscreen {
  /**
   * @param {Function} send 发送消息
   */
  constructor(send) {
    this.send = send;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  async tap(x, y) {
    // Touches appear to be lost during the first frame after navigation.
    // This waits a frame before sending the tap.
    // @see https://crbug.com/613219
    await this.send('Runtime.evaluate', {
      expression: 'new Promise(x => requestAnimationFrame(() => requestAnimationFrame(x)))',
      awaitPromise: true
    });

    const touchPoints = [{ x: Math.round(x), y: Math.round(y) }];
    await this.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints
    });
    await this.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
  }

  /**
   * 单点滑动手势
   * @param {Object} options
   * @param {Object.start} 滑动起始坐标 
   * @param {Object.end} 滑动结束坐标 
   * @param {Object.steps} 步长 
   * @param {Object.delay} 发送move事件的间隔时间 
   */
  async slide({ start, end, steps = 50, delay = 150 }) {

    let { x: startX, y: startY } = start
    let { x: endX, y: endY } = end

    await this.send('Runtime.evaluate', {
      expression: 'new Promise(x => requestAnimationFrame(() => requestAnimationFrame(x)))',
      awaitPromise: true
    });

    await this.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: Math.round(startX), y: Math.round(startY) }]
    });

    let stepX = (endX - startX) / steps
    let stepY = (endY - startY) / steps
    for (let i = 1; i <= steps; i++) {
      await this.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: startX += stepX, y: startY += stepY }]
      });
      await sleep(8);
    }

    // 触点释放前的停留时间
    await sleep(delay);

    await this.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });

  }

}

module.exports = { Keyboard, Mouse, Touchscreen };
