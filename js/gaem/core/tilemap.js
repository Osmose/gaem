define(['underscore', 'core/loader'], function(_, loader) {
    function Tilemap(map_data) {
        var self = this;
        _.extend(this, {
            data: map_data,
            width: map_data.width,
            height: map_data.height,
            tileset: loader.get(map_data.tileset),
            anim: {}
        });

        // Set up animation data
        if (this.tileset.anim !== undefined) {
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

    _.extend(Tilemap.prototype, {
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
        setTile: function(tx, ty, tilenum) {
            this.data.map[ty][tx] = tilenum;
        },

        // IDEA: "Animated" terrain?
        getTerrain: function(tx, ty) {
            return this.data.terrain[ty][tx];
        },
        setTerrain: function(tx, ty, terrain) {
            this.data.terrain[ty][tx] = terrain;
        },

        draw: function(ctx, x, y) {
            this.animate();

            for (var ty = 0; ty < this.data.height; ty++) {
                for (var tx = 0; tx < this.data.width; tx++) {
                    this.tileset.drawTile(ctx,
                                          this.getTile(this.data.map[ty][tx]),
                                          x + (tx * this.tileset.tw),
                                          y + (ty * this.tileset.th));
                }
            }
        },
        collides: function(box) {
            var bounds = this.getContainingTiles(box);
            for (var ty = bounds.top; ty <= bounds.bottom; ty++) {
                for (var tx = bounds.left; tx <= bounds.right; tx++) {
                    if (this.data.terrain[ty][tx] == 1) {
                        return true;
                    }
                }
            }

            return false;
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
