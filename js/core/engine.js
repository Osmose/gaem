define(['underscore', 'core/keyboardcontrols', 'core/tilemap_collection',
         'core/transition', 'util'],
function(_, KeyboardControls, TilemapCollection, Transition, util) {
    var requestFrame = (function() {
        return window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 30);
            };
    })();

    function Engine() {
        _.extend(this, {
            WIDTH: 160,
            HEIGHT: 144,
            SCALE: 3,

            entities: [],
            kb: new KeyboardControls(),
            player: null,
            running: false,
            tilemap: null,
            tilemap_collection: null,
            transition: null
        });

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
            // Don't process normally during a transition
            if (this.transition !== null) return;

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

            // Transition handles animation if present
            if (this.transition !== null) {
                if (this.transition.isComplete()) {
                    this.tilemap = this.transition.to;
                    this.transition = null;
                } else {
                    this.transition.renderStep(this.ctx);
                    return;
                }
            }

            if (this.tilemap !== null) {
                this.tilemap.render(this.ctx, 0, 0);
            }

            _.each(this.entities, function(entity) {
                entity.render(self.ctx);
            });

            if (this.player !== null) {
                this.player.render(this.ctx);
            }
        },
        collides: function(box) {
            var tiles = this.tilemap.collides(box),
                edge = util.box_contains(box, this.screen_box);

            return {
                edge: edge,
                tiles: tiles,
                solid: (edge !== null || tiles.solid)
            };
        },
        loadTilemaps: function(data) {
            this.tilemap_collection = new TilemapCollection(data);
        },
        setTilemap: function(id) {
            this.tilemap = this.tilemap_collection.get(id);
        },
        startTransition: function(mapId, type, params) {
            var mapTo = this.tilemap_collection.get(mapId);
            this.transition = new Transition(type, this, this.tilemap, mapTo,
                                             params);
        }
    });

    return Engine;
});
