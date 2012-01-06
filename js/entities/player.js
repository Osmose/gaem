define(['underscore', 'core/loader', 'util'], function(_, loader, util) {
    function Player(engine, options) {
        this.engine = engine;

        _.defaults(options, {
            x: 0,
            y: 0
        });
        _.extend(this, options);

        this.tiles = loader.get('entities');

        var anim = this.anim = {};
        anim[util.UP] = [2, 10, 3, 10];
        anim[util.DOWN] = [0, 10, 1, 10];
        anim[util.LEFT] = [4, 10, 5, 10];
        anim[util.RIGHT] = [6, 10, 7, 10];

        this.moving = false;
        this.setState(util.DOWN);

        this.bounding_box = {left: 3, top: 3, right: 13, bottom: 14};
    }

    _.extend(Player.prototype, {
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
            if (kb.keys[kb.RIGHT]) {vx += 1; newState = util.RIGHT;}
            if (kb.keys[kb.LEFT]) {vx -= 1; newState = util.LEFT;}
            if (kb.keys[kb.DOWN]) {vy += 1; newState = util.DOWN;}
            if (kb.keys[kb.UP]) {vy -= 1; newState = util.UP;}

            var xc = this.collides(vx, 0),
                yc = this.collides(0, vy);
            if (xc.solid) vx = 0;
            if (yc.solid) vy = 0;

            if (newState !== null) {
                this.setState(newState);
            } else if (!this.moving) {
                // Prevents odd single-pixel-no-animation movement
                this.anim_delay = 0;
            }

            // Check for movement off the side of the screen
            var edge = xc.edge || yc.edge;
            if (edge !== null) {
                var map = this.engine.tilemap.getAdjacentMap(edge);
                if (map !== null) {
                    this.engine.startTransition(map, 'slide', {
                        direction: edge
                    });
                }

                return;
            }

            // Check for a door
            var doors = _.union(xc.tiles.doors, yc.tiles.doors);
            if (doors.length > 0) {
                var tilemap = this.engine.tilemap,
                    door = tilemap.getDoor(doors[0].tx, doors[0].ty);
                if (door !== null) {
                    this.engine.startTransition(door.target, 'fade', {
                        player_x: door.player.x,
                        player_y: door.player.y
                    });
                }
            }

            this.x += vx;
            this.y += vy;
            this.moving = (vx !== 0 || vy !== 0);
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
