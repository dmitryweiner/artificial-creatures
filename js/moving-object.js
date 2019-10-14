'use strict';

class MovingObject extends SimpleObject {

    constructor(x, y, gameField) {
        super(x, y, gameField);
        this.direction = 0;
        this.speed = 0;
    }

    doTurn(maxX, maxY) {

        this.vx = this.speed * Math.cos(this.direction) * this.step;
        this.vy = this.speed * Math.sin(this.direction) * this.step;

        this.x += this.vx;
        this.y += this.vy;

        //check borders
        if (this.x < 0) {
            this.x = 0;
        }

        if (this.y < 0) {
            this.y = 0;
        }

        if (this.x > (maxX - this.size)) {
            this.x = maxX - this.size;
        }

        if (this.y > (maxY - this.size)) {
            this.y = (maxY - this.size);
        }
    }

    redraw() {
        const element = document.getElementById(this.id);
        element.style.left = this.x + 'px';
        element.style.top = this.y + 'px';
        element.style.transform = 'rotate(' + (this.direction + Math.PI) + 'rad)';
    }
}