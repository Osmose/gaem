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

    // Handles the game loop, timing, and dispatching processing and rendering
    // to the active tilemap, entities, and player.
    function Engine(game_data) {
        _.extend(this, {
            entities: [],
            entityClasses: {},
            kb: new KeyboardControls(),
            hud: null,
            map_box: {left: 0, top: 0, right: cst.MAP_WIDTH,
                      bottom: cst.MAP_HEIGHT},
            player: null,
            running: false,
            tilemap: null,
            tilemap_collection: null,
            transition: null
        });

        // Bind the engine to the loop function used as a callback
        // in request frame.
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
        // Process and render a single frame, and schedule another loop
        // for the next frame.
        loop: function() {
            this.tick();
            this.render();
            if (this.running) {
                requestFrame(this.bound_loop, this.canvas);
            }
        },

        // Process one frame of behavior.
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

        // Render the screen.
        render: function() {
            var self = this;

            this.ctx.fillStyle = '#FFFF8B';
            this.ctx.fillRect(0, 0, cst.WIDTH, cst.HEIGHT);

            // Transition handles animation if present
            if (this.transition !== null) {
                if (this.transition.isComplete()) {
                    this.setTilemap(this.transition.to.id);
                    this.transition = null;
                } else {
                    this.transition.renderStep(this.ctx);
                    return;
                }
            }

            // Rendering order (from back to front):
            // 1. Tilemap
            // 2. Entities
            // 3. HUD
            // 4. Player

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

        // Check if the given box collides with other objects
        // in the game.
        collides: function(box) {
            var tiles = this.tilemap.collides(box),
                edge = util.box_contains(box, this.map_box),
                entities = [];

            _.each(this.entities, function(entity) {
                var collision = entity.collidesWith(box);
                if (collision !== null) {
                    entities.push(collision);
                }
            });

            var entity_solid = _.any(entities, function(c) {
                return c.solid;
            });

            return {
                edge: edge,
                tiles: tiles,
                entities: entities,
                solid: (edge !== null || tiles.solid || entity_solid)
            };
        },

        // Set the current tilemap to a new one.
        setTilemap: function(id) {
            this.tilemap = this.tilemap_collection.get(id);
            this.tilemap.resetEntities();
            this.entities = this.tilemap.entities;
        },

        // Set up a transition from the current tilemap to a new one.
        startTransition: function(mapId, type, params) {
            var mapTo = this.tilemap_collection.get(mapId);
            this.transition = new Transition(type, this, this.tilemap, mapTo,
                                             params);
        },

        // Load game data, which includes map and entity information.
        loadGameData: function(data) {
            var self = this;
            this.tilemap_collection = new TilemapCollection(this, data.maps);
            this.player = new Player(this, data.player);
            this.hud = new HUD(this.player);

            this.entity_classes = {};
            _.each(data.entity_classes, function(ecls) {
                self.entity_classes[ecls.id] = ecls;
            });
        },

        // Start the game loop.
        startGame: function() {
            this.running = true;
            this.loop();
        }
    });

    return Engine;
});
