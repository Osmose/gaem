define(['underscore', 'knockout', 'util', 'core/loader'],
function(_, ko, ut, loader) {
    
    // Similar to observableArray, but for tilemaps (array of arrays)
    ko.observableTilemap = function(map) {
        // TODO: Data validation
        var result = new ko.observable(map);
        ko.utils.extend(result, ko.observableTilemap.fn);

        ko.exportProperty(result, 'get', result.get);
        ko.exportProperty(result, 'set', result.set);

        return result;
    };

    ko.observableTilemap.fn = {
        get: function(tx, ty) {
            var map = this();
            return map[ty][tx];
        },
        set: function(tx, ty, tile) {
            var map = this();
            this.valueWillMutate();
            map[ty][tx] = tile;
            this.valueHasMutated();
        }
    };

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
            doors: ut.oget(data, 'doors', []),
            width: width,
            height: height
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
