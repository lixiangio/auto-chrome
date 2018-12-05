"use strict"

const keyDefinitions = require('./USKeyboard');
const { assert, sleep } = require('./helper');

class Keyboard {
   /**
    * @param {Function} send
    */
   constructor(page) {
      this.page = page
      this.send = page.send.bind(page);
      this.modifiers = 0;
      this.pressedKeys = new Set();
   }

   /**
    * @param {string} key
    * @param {{text: string}=} options
    */
   async down(key, options = { text: undefined }) {
      const description = this.keyDescriptionForString(key);

      const autoRepeat = this.pressedKeys.has(description.code);
      this.pressedKeys.add(description.code);
      this.modifiers |= this.modifierBit(description.key);

      const text = options.text === undefined ? description.text : options.text;
      await this.send('Input.dispatchKeyEvent', {
         type: text ? 'keyDown' : 'rawKeyDown',
         modifiers: this.modifiers,
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
   modifierBit(key) {
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
   keyDescriptionForString(keyString) {
      const shift = this.modifiers & 8;
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
      if (this.modifiers & ~8)
         description.text = '';

      return description;
   }

   /**
    * @param {string} key
    */
   async up(key) {
      const description = this.keyDescriptionForString(key);

      this.modifiers &= ~this.modifierBit(description.key);
      this.pressedKeys.delete(description.code);
      await this.send('Input.dispatchKeyEvent', {
         type: 'keyUp',
         modifiers: this.modifiers,
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
         modifiers: this.modifiers,
         text: char,
         key: char,
         unmodifiedText: char
      });
      
   }

   /**
    * @param {string} text
    * @param {{delay: (number|undefined)}=} options
    */
   async type(text) {
      let chars = []
      for (const char of text) {
         if (keyDefinitions[char]) {
            if (chars.length) {
               await this.sendCharacter(chars.join(''));
               chars = []
            }
            await this.press(char, { delay: 20 }); // 键盘输入
         } else {
            chars.push(char)
         }
         await sleep(200)
      }
      // 直接赋值
      if (chars.length) {
         await this.sendCharacter(chars.join(''));
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

module.exports = Keyboard