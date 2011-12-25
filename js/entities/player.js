define(['underscore'], function(_) {
    function Player(engine, options) {
        this.eng = engine;

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
                    if (this.anim_frame > (anim.length / 2)) {
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
                this.tiles.drawTile(ctx, this.anim_tile, this.x - 8,
                                    this.y - 8);
            }
        },
        tick: function() {
            var kb = this.eng.kb,
                vx = 0, vy = 0;

            if (kb.keys[kb.RIGHT]) {vx += 1; this.setState(this.RIGHT);}
            if (kb.keys[kb.LEFT]) {vx -= 1; this.setState(this.LEFT);}
            if (kb.keys[kb.DOWN]) {vy += 1; this.setState(this.DOWN);}
            if (kb.keys[kb.UP]) {vy -= 1; this.setState(this.UP);}

            this.x += vx;
            this.y += vy;
            this.moving = (vx !== 0 || vy !== 0);
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
