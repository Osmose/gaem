define(['underscore', 'core/loader', 'util'], function(_, loader, util) {
    function Tilemap(map_data) {
        var self = this;

        // Load attributes from map data
        _.each(Tilemap.load_attrs, function(attr) {
            self[attr] = map_data[attr];
        });
        _.extend(self, {
            tileset: loader.get(map_data.tileset),
            anim: {}
        });

        // Set up animation data
        if (self.tileset.anim !== undefined) {
            _.each(this.tileset.anim, function(anim_data, i) {
                self.anim[i] = {
                    tile: anim_data[0],
                    frame: 0,
                    delay: anim_data[1],
                    len: anim_data.length,
                    data: anim_data
                };
            });
        }
    }
    Tilemap.load_attrs = ['id', 'tiles', 'terrain', 'north', 'south', 'east',
                          'west', 'doors', 'width', 'height'];

    _.extend(Tilemap.prototype, {
        SOLID: 1,
        DOOR: 2,
        tile_types: {
            1: 'solid',
            2: 'door'
        },
        animate: function() {
            _.each(this.anim, function(tile_anim) {
                tile_anim.delay--;
                if (tile_anim.delay <= 0) {
                    tile_anim.frame += 2;
                    if (tile_anim.frame >= tile_anim.len) {
                        tile_anim.frame = 0;
                    }

                    tile_anim.tile = tile_anim.data[tile_anim.frame];
                    tile_anim.delay = tile_anim.data[tile_anim.frame + 1];
                }
            });
        },
        getTile: function(tilenum) {
            if (this.anim.hasOwnProperty(tilenum)) {
                return this.anim[tilenum].tile;
            } else {
                return tilenum;
            }
        },
        // IDEA: "Animated" terrain?
        getTerrain: function(tx, ty) {
            return this.terrain[ty][tx];
        },

        // Return the door at the specified tile, or null if there is none.
        getDoor: function(tx, ty) {
            var door = _.find(this.doors, function(door) {
                return door.tx === tx && door.ty === ty;
            });

            return (door !== undefined) ? door : null;
        },

        // Return the ID of the adjacent map in the specified direction,
        // or null if there is none;
        getAdjacentMap: function(direction) {
            var direction_string = util.directionToString(direction);
            if (this[direction_string] !== null) {
                return this[direction_string];
            }

            return null;
        },

        // Render this tilemap on the given canvas context at the given
        // x/y position.
        render: function(ctx, x, y) {
            this.animate();

            for (var ty = 0; ty < this.height; ty++) {
                for (var tx = 0; tx < this.width; tx++) {
                    this.tileset.drawTile(ctx,
                                          this.getTile(this.tiles[ty][tx]),
                                          x + (tx * this.tileset.tw),
                                          y + (ty * this.tileset.th));
                }
            }
        },
        collides: function(box) {
            var bounds = this.getContainingTiles(box),
                collides = {
                    solid: false,
                    doors: []
                };
            for (var ty = bounds.top; ty <= bounds.bottom; ty++) {
                for (var tx = bounds.left; tx <= bounds.right; tx++) {
                    switch (this.terrain[ty][tx]) {
                    case this.SOLID:
                        collides.solid = true;
                        break;
                    case this.DOOR:
                        collides.doors.push({tx: tx, ty: ty});
                        break;
                    }
                }
            }

            return collides;
        },
        getContainingTiles: function(box) {
            // Bound units are tiles, inclusive
            return {
                left: Math.max(0, Math.floor(box.left / this.tileset.tw)),
                top: Math.max(0, Math.floor(box.top / this.tileset.th)),
                right: Math.min(this.width - 1,
                                Math.floor(box.right / this.tileset.tw)),
                bottom: Math.min(this.height - 1,
                                 Math.floor(box.bottom / this.tileset.th))
            };
        }
    });

    return Tilemap;
});
