import SimpleObject from './object.mjs';
import { getEmojiForFood } from './utils.mjs';

export default class Food extends SimpleObject {

    static SIZE = 20;

    constructor(x, y, gameField) {
        super(x, y, gameField); // parent constructor
        this.sign = getEmojiForFood();
    }

    createDOMElement() {
        if (this.gameField.isFake) {
            return;
        }

        const element = document.createElement('div');
        element.setAttribute('id', this.id);
        element.innerHTML = this.sign;
        element.setAttribute('class', 'food');
        element.style.left = this.x + 'px';
        element.style.top = this.y + 'px';
        this.gameField.appendChild(element);
    }
}
