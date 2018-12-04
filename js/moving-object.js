'use strict';

function MovingObject(x, y) {
    SimpleObject.call(this, x, y);
    this.direction = 0;
    this.mass = 1;
    this.size = MovingObject.prototype.SIZE; // get from image
}

MovingObject.prototype = Object.create(SimpleObject.prototype, {
    doTurn: {
        value: function(maxX, maxY) {
            switch(this.direction) {
                case 1:
                    this.y -= this.step;
                    break;
                case 2:
                    this.x += this.step;
                    break;
                case 3:
                    this.y += this.step;
                    break;
                case 4:
                    this.x -= this.step;
                    break;
                default:
                    break;
            }

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
        },
        enumerable: true,
        configurable: true,
        writable: false
    },
    redraw: {
        value: function() {
            const element = document.getElementById(this.id);
            const angle = (this.direction - 1) * 90;

            element.style.left = this.x + 'px';
            element.style.top = this.y + 'px';
            element.style.transform =  'rotate(' + angle + 'deg)';
        },
        enumerable: true,
        configurable: true,
        writable: false
    },
});

MovingObject.prototype.constructor = MovingObject;
