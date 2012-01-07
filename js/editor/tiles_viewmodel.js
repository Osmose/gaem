define(['underscore', 'jquery', 'knockout', 'editor/constants', 'util',
        'core/loader', 'editor/common'],
function(_, $, ko, cst, ut, loader, common) {
    function TilesViewModel(editor) {
        var self = this;
        self.maps = editor.maps;
        self.currentMap = editor.currentMap;
        self.currentMapId = editor.currentMapId;
        self.currentTile = ko.observable(0);
        self.currentTileset = ko.computed(function() {
            return self.currentMap().tileset();
        });

        self.tileClick = function(pos) {
            var tile = self.currentTile(),
                tiles = self.currentMap().tiles;

            if (tiles.get(pos.tx, pos.ty) !== tile) {
                tiles.set(pos.tx, pos.ty, tile);
            }
        };
    }

    ko.bindingHandlers.tileEditor = {
        init: function(canvas, paramsAccessor) {
            var params = paramsAccessor(),
                click = params.click,
                tileset = loader.get(params.map().tileset()),
                mousePos = common.createMousePos(tileset);
            ut.canvas(cst.WIDTH, cst.HEIGHT, cst.SCALE, canvas);

            common.bindDrawing(canvas, mousePos, click);
        },
        update: function(canvas, paramsAccessor) {
            var ctx = canvas.getContext('2d'),
                params = paramsAccessor(),
                map = params.map(),
                tileset = loader.get(map.tileset());

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, cst.WIDTH, cst.HEIGHT);
            for (var ty = 0; ty < map.height; ty++) {
                for (var tx = 0; tx < map.width; tx++) {
                    tileset.drawTile(ctx, map.tiles.get(tx, ty),
                                     tx * tileset.tw, ty * tileset.th);
                }
            }
        }
    };

    ko.bindingHandlers.tilePalette = {
        init: function(canvas, paramsAccessor) {
            var params = paramsAccessor(),
                tileset = loader.get(params.tileset()),
                currentTile = params.currentTile;

            $(canvas).click(function(e) {
                var x = e.pageX - this.offsetLeft,
                    y = e.pageY - this.offsetTop,
                    tx = Math.floor(x / (tileset.tw + tileset.xGap)),
                    ty = Math.floor(y / (tileset.th + tileset.yGap));

                currentTile((ty * tileset.img_tw) + tx);
            });
        },
        update: function(canvas, paramsAccessor) {
            var params = paramsAccessor(),
                ctx = canvas.getContext('2d'),
                tileset = loader.get(params.tileset());

            canvas.width = tileset.img.width;
            canvas.height = tileset.img.height;

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, cst.WIDTH, cst.HEIGHT);
            ctx.drawImage(tileset.img, 0, 0);
        }
    };

    ko.bindingHandlers.tile = {
        init: function(canvas, paramsAccessor) {
            var params = paramsAccessor(),
                tileset = loader.get(params.tileset());
            ut.canvas(tileset.tw, tileset.th, cst.SCALE, canvas);
        },
        update: function(canvas, paramsAccessor) {
            var ctx = canvas.getContext('2d'),
                params = paramsAccessor(),
                tileset = loader.get(params.tileset()),
                currentTile = params.tile();

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            tileset.drawTile(ctx, currentTile, 0, 0);
        }
    };

    return TilesViewModel;
});
