define(['underscore', 'core/tilemap'], function(_, Tilemap) {
    function TilemapCollection(map_data) {
        this.map_data = map_data;
        this._tilemaps = {};
    }

    _.extend(TilemapCollection.prototype, {
        get: function(id) {
            if (!this.map_data.hasOwnProperty(id)) {
                return undefined;
            }

            if (!this._tilemaps.hasOwnProperty(id)) {
                this._tilemaps[id] = new Tilemap(this.map_data[id]);
            }

            return this._tilemaps[id];
        }
    });

    return TilemapCollection;
});
