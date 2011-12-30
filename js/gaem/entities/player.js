define(['underscore'], function(_) {
    function Player(engine, options) {
        this.engine = engine;

        _.defaults(options, {
            x: 0,
            y: 0
        });
        _.extend(this, options);

        this.tiles = engine.loader.get('entities');

        var anim = this.anim = {};
        anim[this.UP] = [2, 10, 3, 10];
        anim[this.DOWN] = [0, 10, 1, 10];
        anim[this.LEFT] = [4, 10, 5, 10];
        anim[this.RIGHT] = [6, 10, 7, 10];

        this.moving = false;
        this.setState(this.DOWN);

        this.bounding_box = {left: 1, top: 1, right: 15, bottom: 15};
    }

    _.extend(Player.prototype, {
        UP: 0,
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3,
        animate: function(ctx) {
            if (this.moving === true && this.anim_delay !== null) {
                this.anim_delay--;
                if (this.anim_delay <= 0) {
                    var anim = this.anim[this.state];
                    this.anim_frame += 2;
                    if (this.anim_frame >= anim.length) {
                        this.anim_frame = 0;
                    }

                    this.anim_tile = anim[this.anim_frame];
                    this.anim_delay = anim[this.anim_frame + 1];
                }
            }
        },
        render: function(ctx) {
            this.animate();
            if (this.tiles !== null) {
                this.tiles.drawTile(ctx, this.anim_tile, this.x, this.y);
            }
        },
        tick: function() {
            var kb = this.engine.kb,
                vx = 0, vy = 0;

            var newState = null;
            if (kb.keys[kb.RIGHT]) {vx += 1; newState = this.RIGHT;}
            if (kb.keys[kb.LEFT]) {vx -= 1; newState = this.LEFT;}
            if (kb.keys[kb.DOWN]) {vy += 1; newState = this.DOWN;}
            if (kb.keys[kb.UP]) {vy -= 1; newState = this.UP;}

            var xCollides = this.collides(vx, 0),
                yCollides = this.collides(0, vy);
            if (xCollides.length !== 0) vx = 0;
            if (yCollides.length !== 0) vy = 0;

            this.x += vx;
            this.y += vy;
            this.moving = (vx !== 0 || vy !== 0);
            if (newState !== null) {
                this.setState(newState);
            } else if (!this.moving) {
                // Prevents odd single-pixel-no-animation movement
                this.anim_delay = 0;
            }
        },
        collides: function(vx, vy) {
            var box = this.getBoundingBox(this.x + vx, this.y + vy);
            return this.engine.collides(box);
        },
        getBoundingBox: function(x, y) {
            return {
                left: x + this.bounding_box.left,
                right: x + this.bounding_box.right,
                top: y + this.bounding_box.top,
                bottom: y + this.bounding_box.bottom
            };
        },
        setState: function(state) {
            if (state !== this.state) {
                this.state = state;
                if (_.isArray(this.anim[state])) {
                    this.anim_tile = this.anim[state][0];
                    this.anim_delay = this.anim[state][1];
                    this.anim_frame = 0;
                } else {
                    this.anim_tile = this.anim[state];
                    this.anim_delay = null;
                }
            }
        }
    });

    return Player;
});