define(function(require) {
    var ko = require('knockout'),
        ut = require('util'),
        cst = require('./constants'),
        loader = require('core/loader');

    // Binding for drawing a tilemap on a canvas
    ko.bindingHandlers.tilemap = {
        init: function(canvas, mapAccessor, allBindingsAccessor) {
            var allBindings = allBindingsAccessor(),
                scale = allBindings['tilemapScale'] || cst.SCALE;
            ut.canvas(cst.WIDTH, cst.HEIGHT, scale, canvas);
        },
        update: function(canvas, mapAccessor) {
            var ctx = canvas.getContext('2d'),
                map = mapAccessor()(),
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

    // Binding for drawing an arbitrary image on a canvas
    ko.bindingHandlers.image = {
        update: function(canvas, imgAccessor) {
            var ctx = canvas.getContext('2d'),
                img = imgAccessor()();
            ut.canvas(img.width, img.height, 1, canvas);
            ctx.drawImage(img, 0, 0);
        }
    };
});
