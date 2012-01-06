define(['underscore', 'util', 'core/tilemap'], function(_, ut, Tilemap) {
    function TilemapCollection(maps) {
        this.maps = maps;;
        this._tilemaps = {};
    }

    _.extend(TilemapCollection.prototype, {
        // Retrieve a map object with the given id.
        // Maps are lazy-loaded from the game file.
        get: function(id) {
            if (ut.oget(this._tilemaps, id, false) === false) {
                // Create the map
                var map_data = _.find(this.maps, function(map) {
                    return map.id === id;
                });

                if (map_data === undefined) {
                    return undefined;
                } else {
                    this._tilemaps[id] = new Tilemap(map_data);
                }
            }

            return this._tilemaps[id];
        }
    });

    return TilemapCollection;
});
