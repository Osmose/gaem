define(['underscore', 'core/loader', 'util'], function(_, loader, ut) {
    function Entity(engine, data) {
        var self = this;

        _.defaults(data, {
            id: _.uniqueId(),
            x: 0,
            y: 0,
            tileset_id: null,
            sprite_id: null,
            solid: false,
            bounding_box: {left: 0, top: 0, right: 0, bottom: 0}
        });

        _.extend(this, data, {
            engine: engine,
            sprite_delay: null,
            sprite_tile: null,
            sprite_frame: 0
        });

        // Sprites define the tiles used to display the entity,
        // including animation data.
        this.sprites = {};
        _.each(ut.oget(data, 'sprites', {}), function(sprite, id) {
            // Animated sprites use an array of alternating tile, delay
            // numbers.
            self.sprites[id] = {
                animated: _.isArray(sprite),
                data: sprite
            };
        });
    }

    _.extend(Entity.prototype, {
        // Animate the current sprite
        animate: function(ctx) {
            var sprite = this.sprites[this.sprite_id];
            if (sprite.animated) {
                this.sprite_delay--;  // Sprite delay counts down
                if (this.sprite_delay <= 0) {
                    // Each two entries in cur_sprite.data represent an
                    // animation frame.
                    this.sprite_frame += 2;

                    // Wrap animation back to start
                    if (this.sprite_frame >= sprite.data.length) {
                        this.sprite_frame = 0;
                    }

                    this.sprite_tile = sprite.data[this.sprite_frame];
                    this.sprite_delay = sprite.data[this.sprite_frame + 1];
                }
            }
        },

        tick: ut.noop,

        // Render entity at it's current position.
        render: function(ctx) {
            var tiles = loader.get(this.tileset_id);

            this.animate();
            if (tiles !== null) {
                tiles.drawTile(ctx, this.sprite_tile, this.x, this.y);
            }
        },

        // Check if entity is colliding with anything.
        collides: function(vx, vy) {
            var box = this.getBoundingBox(this.x + vx, this.y + vy);
            return this.engine.collides(box);
        },

        // Check if this entity is colliding with the given box.
        // If there is a collision, return data about the collision.
        // If not, return null.
        collidesWith: function(box) {
            var my_box = this.getBoundingBox(this.x, this.y);
            if (ut.box_collision(my_box, box)) {
                return {
                    entity: this,
                    damage: null,
                    solid: this
                };
            } else {
                return null;
            }
        },

        // Generate a collision box for this entity at the given coordinates.
        getBoundingBox: function(x, y) {
            return {
                left: x + this.bounding_box.left,
                right: x + this.bounding_box.right,
                top: y + this.bounding_box.top,
                bottom: y + this.bounding_box.bottom
            };
        },

        // Set the sprite for this entity. Resets current animation unless
        // the given sprite is the current sprite.
        setSprite: function(sprite_id) {
            if (this.sprite_id !== sprite_id) {
                var sprite = this.sprites[sprite_id];
                this.sprite_id = sprite_id;
                if (sprite.animated) {
                    this.sprite_tile = sprite.data[0];
                    this.sprite_delay = sprite.data[1];
                    this.sprite_frame = 0;
                } else {
                    this.sprite_tile = sprite.data;
                }
            }
        }
    });

    return Entity;
});
