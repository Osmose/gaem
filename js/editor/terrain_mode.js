define(['underscore', 'ICanHaz', 'core/loader'], function(_, ich, loader) {
    function TerrainMode(editor) {
        var tileset = this.tileset = loader.get('terrain');

        this.editor = editor;
        this.currentTerrain = null;
        this.terrain =  [
            {name: 'Empty', tile: 0},
            {name: 'Solid', tile: 1}
        ];

        // Generate previews
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        canvas.width = tileset.tw * editor.SCALE;
        canvas.height = tileset.th * editor.SCALE;
        ctx.scale(editor.SCALE, editor.SCALE);
        ctx.mozImageSmoothingEnabled = false;

        _.each(this.terrain, function(tile) {
            tileset.drawTile(ctx, tile.tile, 0, 0);
            tile.img = '<img src="' + canvas.toDataURL('image/png') + '">';
        });
    }

    _.extend(TerrainMode.prototype, {
        init: function() {
            var self = this;

            this.editor.$sidebar.empty().html(ich.terrain_mode({
                terrain: this.terrain
            }));

            $('#terrain-list input').change(function(e) {
                if (this.checked) {
                    self.currentTerrain = parseInt($(this).val(), 10);
                }
            });
        },
        map_click: function(tx, ty) {
            if (this.currentTerrain !== null) {
                this.editor.tilemap.setTerrain(tx, ty, this.currentTerrain);
                this.editor.updateJSON();
            }
        },
        render: function(ctx) {
            var oldAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 0.7;

            var tilemap = this.editor.tilemap;
            for (var ty = 0; ty < tilemap.height; ty++) {
                for (var tx = 0; tx < tilemap.width; tx++) {
                    this.tileset.drawTile(ctx, tilemap.getTerrain(tx, ty),
                                          tx * this.tileset.tw,
                                          ty * this.tileset.th);
                }
            }

            ctx.globalAlpha = oldAlpha;
        }
    });

    return TerrainMode;
});
