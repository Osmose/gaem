define(['underscore', 'core/keyboardcontrols', 'core/tilemap_collection',
         'util'],
function(_, KeyboardControls, TilemapCollection, util) {
    var requestFrame = (function() {
        return window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 30);
            };
    })();

    function Engine() {
        this.WIDTH = 160;
        this.HEIGHT = 144;
        this.SCALE = 3;
        this.running = false;
        this.kb = new KeyboardControls();
        this.entities = [];
        this.tilemap = null;
        this.tilemap_collection = null;
        this.player = null;
        this.screen_box = {left: 0, top: 0, right: this.WIDTH,
                           bottom: this.HEIGHT - 16};

        this.bound_loop = this.loop.bind(this);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = this.WIDTH * this.SCALE;
        this.canvas.height = this.HEIGHT * this.SCALE;
        this.ctx.scale(this.SCALE, this.SCALE);
        this.ctx.mozImageSmoothingEnabled = false;

        document.getElementById('gaem').appendChild(this.canvas);
    }

    _.extend(Engine.prototype, {
        loop: function() {
            this.tick();
            this.render();
            if (this.running) {
                requestFrame(this.bound_loop, this.canvas);
            }
        },
        tick: function() {
            if (this.player !== null) {
                this.player.tick();
            }

            _.each(this.entities, function(entity) {
                entity.tick();
            });
        },
        render: function() {
            var self = this;

            this.ctx.fillStyle = '#FFFF8B';
            this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

            if (this.tilemap !== null) {
                this.tilemap.draw(this.ctx, 0, 0);
            }

            _.each(this.entities, function(entity) {
                entity.render(self.ctx);
            });

            if (this.player !== null) {
                this.player.render(this.ctx);
            }
        },
        collides: function(box, border_collision) {
            var collides = [];
            if (border_collision === undefined) border_collision = true;

            if (border_collision) {
                if (util.box_contains(box, this.screen_box) !== true) {
                    collides.push('bounds');
                }
            }

            if (this.tilemap.collides(box)) {
                collides.push('tiles');
            }

            return collides;
        },
        loadTilemaps: function(data) {
            this.tilemap_collection = new TilemapCollection(data);
        },
        setTilemap: function(id) {
            this.tilemap = this.tilemap_collection.get(id);
        },
        mapTransition: function(direction) {
            var direction_string = util.directionToString(direction);
            if (this.tilemap.data[direction_string] !== null) {
                var player = this.player;

                switch (direction) {
                case util.WEST:
                    player.x = this.WIDTH - player.bounding_box.right;
                    break;
                case util.EAST:
                    player.x = player.bounding_box.left;
                    break;
                case util.NORTH:
                    player.y = this.HEIGHT - 16 - player.bounding_box.bottom;
                    break;
                case util.SOUTH:
                    player.y = player.bounding_box.top;
                    break;
                }

                this.setTilemap(this.tilemap.data[direction_string]);
            };
        }
    });;

    return Engine;
});
