define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout'),

        cst = require('editor/constants'),
        loader = require('core/loader'),
        ut = require('util'),

        maps_general = require('text!./general.html'),
        maps_tiles = require('text!./tiles.html'),
        maps_terrain = require('text!./terrain.html');

    function MapsViewModel(editor) {
        var self = this;
        this.editor = editor;
        this.map = ko.observable();
        this.tileset = ko.computed(function() {
            return self.map() ? loader.get(self.map().tileset()) : undefined;
        });

        this.workspace = {
            tabs: [
                {name: 'General', anchor: 'maps-general',
                 class_attr: '', content: maps_general},
                {name: 'Tiles', anchor: 'maps-tiles',
                 class_attr: 'tilemap-editor', content: maps_tiles},
                {name: 'Terrain', anchor: 'maps-terrain',
                 class_attr: 'tilemap-editor', content: maps_terrain}
            ]
        };

        /**************
         Tilemap Editor
         **************/
        this.curTile = ko.observable(0);
        this.tileset_img = ko.computed(function() {
            return self.tileset() ? self.tileset().img : undefined;
        });

        // Paint tiles onto tilemap.
        this.paint_tile = function(e) {
            var tileset = self.tileset(),
                pos = ut.mouseTilePos(this, e, tileset.tw * cst.SCALE,
                                      tileset.th * cst.SCALE);
            self.map().tiles.set(pos.tx, pos.ty, self.curTile());
        };

        // Change the current tile to paint with.
        this.change_tile = function(data, e) {
            var tileset = self.tileset(),
                pos = ut.mouseTilePos(e.target, e,
                                      (tileset.tw + tileset.xGap) * 2,
                                      (tileset.th + tileset.yGap) * 2);
            self.curTile(self.tileset().getTilenum(pos.tx, pos.ty));
        };

        // Draw a red box around the current
        this.draw_palette_box = function(canvas) {
            var ctx = canvas.getContext('2d'),
                tileset = self.tileset(),
                tilepos = tileset.getTilePos(self.curTile());

            ctx.save();
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            ctx.strokeRect(tilepos.x,
                           tilepos.y,
                           tileset.tw + tileset.xGap,
                           tileset.th + tileset.yGap);
            ctx.restore();
        };

        /**************
         Terrain Editor
         **************/
        // Hide terrain behind computed to cast to int
        this._current_terrain = ko.observable(0);
        this.current_terrain = ko.computed({
            read: function() {
                return self._current_terrain();
            },
            write: function(value) {
                self._current_terrain(parseInt(value));
            }
        });

        // List of available terrain types
        this.terrain_types = [
            {name: 'Empty', value: 0},
            {name: 'Solid', value: 1}
        ];

        // Generate preview icons for terrain
        var terrain_tileset = loader.get('terrain');
        _.each(this.terrain_types, function(type) {
            type.canvas = terrain_tileset.getTileCanvas(type.value);
        });

        this.paint_terrain = function(e) {
            var tileset = self.tileset(),
                pos = ut.mouseTilePos(this, e, tileset.tw * cst.SCALE,
                                      tileset.th * cst.SCALE);
            self.map().terrain.set(pos.tx, pos.ty, self.current_terrain());
        };

        this.draw_terrain = function(canvas) {
            var ctx = canvas.getContext('2d'),
                map = self.map();

            ctx.save();
            ctx.globalAlpha = 0.8;
            ut.renderMap(ctx, map.terrain(), terrain_tileset,
                         map.width, map.height);
            ctx.restore();
        };
    }

    return MapsViewModel;
});
