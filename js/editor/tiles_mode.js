define(['underscore', 'jquery', 'ICanHaz'], function(_, $, ich) {
    function TilesMode(editor) {
        this.currentTile = 0;
        this.currentTileCtx = null;
        this.editor = editor;
    };

    _.extend(TilesMode.prototype, {
        init: function() {
            var self = this;

            this.editor.$sidebar.empty().html(ich.tiles_mode());
            this.initPalette();
            this.initCurTile();

            $('#palette').click(function(e) {
                var tileset = self.editor.tilemap.tileset,
                    x = e.pageX - this.offsetLeft,
                    y = e.pageY - this.offsetTop,
                    tx = Math.floor(x / (tileset.tw + tileset.xGap)),
                    ty = Math.floor(y / (tileset.th + tileset.yGap));

                self.setCurrentTile((ty * tileset.img_tw) + tx);
            });
        },
        initPalette: function() {
            var img = this.editor.tilemap.tileset.img,
                canvas = document.getElementById('palette'),
                ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        },
        initCurTile: function() {
            var tileset = this.editor.tilemap.tileset,
                canvas = document.getElementById('current-tile');
            this.currentTileCtx = canvas.getContext('2d');

            canvas.width = tileset.tw * 3;
            canvas.height = tileset.th * 3;
            this.currentTileCtx.scale(3, 3);
            this.currentTileCtx.mozImageSmoothingEnabled = false;

            this.setCurrentTile(0);
        },
        map_click: function(tx, ty) {
            this.editor.tilemap.setTile(tx, ty, this.currentTile);
            this.editor.updateJSON();
        },
        setCurrentTile: function(tile) {
            this.currentTile = tile;

            // TODO: This is a lot of dots. :(
            this.editor.tilemap.tileset.drawTile(this.currentTileCtx, tile,
                                                 0, 0);
        }
    });

    return TilesMode;
});
