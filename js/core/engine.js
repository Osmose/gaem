define(['underscore', 'core/constants', 'util', 'core/loader',
        'core/keyboardcontrols', 'core/tilemap_collection', 'core/transition',
        'entities/player', 'interface/hud'],
function(_, cst, util, loader, KeyboardControls, TilemapCollection, Transition,
         Player, HUD) {

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
            entities: [],
            kb: new KeyboardControls(),
            player: new Player(this, {
                x: 16,
                y: 16
            }),
            running: false,
            tilemap: null,
            tilemap_collection: null,
            transition: null
        });

        this.hud = new HUD(this.player);

        this.map_box = {left: 0, top: 0, right: cst.MAP_WIDTH,
                           bottom: cst.MAP_HEIGHT};
        this.bound_loop = this.loop.bind(this);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = cst.WIDTH * cst.SCALE;
        this.canvas.height = cst.HEIGHT * cst.SCALE;
        this.ctx.scale(cst.SCALE, cst.SCALE);
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
            this.ctx.fillRect(0, 0, cst.WIDTH, cst.HEIGHT);

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

            this.hud.render(this.ctx, 0, cst.MAP_HEIGHT);

            if (this.player !== null) {
                this.player.render(this.ctx);
            }
        },
        collides: function(box) {
            var tiles = this.tilemap.collides(box),
                edge = util.box_contains(box, this.map_box);

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
