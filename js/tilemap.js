define(['underscore'], function(_) {
    function Tilemap(tiles, tiledata) {
        var self = this;

        this.tiles = tiles;
        this.tiledata = tiledata;
        this.anim = {};

        _.each(tiledata.anim, function(anim_data, i) {
            self.anim[i] = {
                tile: anim_data[0],
                frame: 0,
                delay: anim_data[1],
                len: anim_data.length,
                data: anim_data
            };
        });
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
        draw: function(ctx, x, y) {
            this.animate();

            var data = this.tiledata,
                map = data.map,
                tile;
            for (var ty = 0; ty < data.height; ty++) {
                for (var tx = 0; tx < data.width; tx++) {
                    tile = this.getTile(map[ty][tx]);
                    this.tiles.drawTile(ctx, tile, x + (tx * data.tileWidth),
                                        y + (ty * data.tileHeight));
                }
            }
        },
        getTile: function(tilenum) {
            if (this.anim.hasOwnProperty(tilenum)) {
                return this.anim[tilenum].tile;
            } else {
                return tilenum;
            }
        }
    });

    return Tilemap;
});
