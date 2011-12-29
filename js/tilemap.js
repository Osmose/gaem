define(['underscore'], function(_) {
    function Tilemap(engine, map) {
        var self = this;

        this.engine = engine;
        _.extend(this, map);
        this.tileset = engine.loader.get(this.tileset);

        // Set up animation data
        this.anim = {};
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
        draw: function(ctx, x, y) {
            this.animate();

            for (var ty = 0; ty < this.height; ty++) {
                for (var tx = 0; tx < this.width; tx++) {
                    this.tileset.drawTile(ctx,
                                          this.getTile(this.map[ty][tx]),
                                          x + (tx * this.tileset.tw),
                                          y + (ty * this.tileset.th));
                }
            }
        }
    });

    return Tilemap;
});
