define(function(require) {
    var _ = require('underscore'),
        ko = require('knockout'),

        loader = require('core/loader'),
        ut = require('util'),

        Entity = require('editor/models/entity');

    function buildMap(width, height) {
        var map = new Array(height);  // Constructor lets us specify width
        for (var ty = 0; ty < height; ty++) {
            map[ty] = new Array(width);
            for (var tx = 0; tx < width; tx++) {
                map[ty][tx] = 0;
            }
        }

        return map;
    }

    // Model for tilemaps
    function Map(id, tileset, width, height, data) {
        var self = this;
        _.extend(this, {
            id: ko.observable(id),
            tileset: ko.observable(tileset),
            tiles: ko.observableTilemap(
                this._getMap(data, 'tiles', width, height)
            ),
            terrain: ko.observableTilemap(
                this._getMap(data, 'terrain', width, height)
            ),
            exits: {
                north: ko.observable(ut.oget(data.exits, 'north')),
                south: ko.observable(ut.oget(data.exits, 'south')),
                east: ko.observable(ut.oget(data.exits, 'east')),
                west: ko.observable(ut.oget(data.exits, 'west'))
            },
            entities: ko.observableArray(),
            doors: ut.oget(data, 'doors', []),
            width: width,
            height: height
        });

        _.each(data.entities, function(data) {
            self.entities.push(new Entity(data));
        });
    }

    _.extend(Map.prototype, {
        _getMap: function(data, attr, width, height) {
            var map = ut.oget(data, attr, false);
            if (map === false) {
                map = buildMap(width, height);
            }

            return map;
        },
        render: function(ctx) {
            var tileset = loader.get(this.tileset());
            ut.renderMap(ctx, this.tiles(), tileset, this.width, this.height);
        }
    });

    return Map;
});
